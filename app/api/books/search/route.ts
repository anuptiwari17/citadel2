// app/api/books/search/route.ts

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { supabase } from '../../../../lib/supabase'
import { 
  ApiResponse, 
  Book, 
  SearchBooksQuery, 
  UserRole 
} from '../../../../types/database'

interface BookSearchResult {
  book: Book
  total_copies: number
  available_copies: number
  shelf_location: string | null
}

// Helper: Get current user from JWT cookie
async function getCurrentUser(): Promise<{ role: UserRole } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('citadel-auth')?.value

  if (!token) return null

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { role: UserRole }

    if (!payload.role || !['Admin', 'Librarian', 'Faculty', 'Student'].includes(payload.role)) {
      return null
    }

    return { role: payload.role }
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  // AUTHORIZATION — Only logged-in users can search
  const user = await getCurrentUser()
  if (!user) {
    return Response.json({
      success: false,
      error: 'Unauthorized. Please login to search books.'
    } as ApiResponse<never>, { status: 401 })
  }

  const { searchParams } = new URL(request.url)

  const query: SearchBooksQuery = {
    q: searchParams.get('q')?.trim() || undefined,
    author: searchParams.get('author')?.trim() || undefined,
    isbn: searchParams.get('isbn')?.trim() || undefined,
    category: searchParams.get('category')?.trim() || undefined,
    available_only: searchParams.get('available_only') as 'true' | 'false' | undefined
  }

  try {
    // Step 1: Search books
    let booksQuery = supabase
      .from('books')
      .select(`
        id,
        title,
        author,
        isbn,
        publisher,
        publication_year,
        category_id,
        shelf_location,
        created_at,
        updated_at
      `)

    if (query.q) booksQuery = booksQuery.ilike('title', `%${query.q}%`)
    if (query.author) booksQuery = booksQuery.ilike('author', `%${query.author}%`)
    if (query.isbn) booksQuery = booksQuery.eq('isbn', query.isbn)
    if (query.category) booksQuery = booksQuery.ilike('category_id', `%${query.category}%`)

    const { data: booksData, error: booksError } = await booksQuery

    if (booksError) throw booksError
    if (!booksData || booksData.length === 0) {
      return Response.json({
        success: true,
        data: [],
        message: 'No books found.'
      } as ApiResponse<BookSearchResult[]>)
    }

    // Step 2: Get copy stats
    const bookIds = booksData.map(book => book.id)

    const { data: copies, error: copiesError } = await supabase
      .from('book_copies')
      .select('book_id, status')
      .in('book_id', bookIds)

    if (copiesError) throw copiesError

    // Count total & available copies
    const copyStats = bookIds.reduce((acc, id) => {
      acc[id] = { total: 0, available: 0 }
      return acc
    }, {} as Record<number, { total: number; available: number }>)

    copies?.forEach(copy => {
      copyStats[copy.book_id].total += 1
      if (copy.status === 'Available') {
        copyStats[copy.book_id].available += 1
      }
    })

    // Step 3: Build results
    const results: BookSearchResult[] = booksData.map(book => ({
      book: book as Book,
      total_copies: copyStats[book.id]?.total || 0,
      available_copies: copyStats[book.id]?.available || 0,
      shelf_location: book.shelf_location
    }))

    const finalResults = query.available_only === 'true'
      ? results.filter(r => r.available_copies > 0)
      : results

    return Response.json({
      success: true,
      data: finalResults
    } as ApiResponse<BookSearchResult[]>)

  } catch (error) {
    console.error('Search failed:', error)
    return Response.json({
      success: false,
      error: 'Something went wrong. Please try again.'
    } as ApiResponse<never>, { status: 500 })
  }
}