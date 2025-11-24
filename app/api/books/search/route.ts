// app/api/books/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Get search parameters from URL
    const { searchParams } = new URL(req.url)
    const searchType = searchParams.get('type') || 'title' // title, author, isbn, category
    const query = searchParams.get('query')?.trim() || ''
    const categoryId = searchParams.get('categoryId')

    // Validate search query
    if (!query && !categoryId) {
      return NextResponse.json(
        { error: 'Search query or category is required' },
        { status: 400 }
      )
    }

    // Build the query based on search type
    let booksQuery = supabase
      .from('books')
      .select(`
        id,
        title,
        author,
        isbn,
        publisher,
        publication_year,
        total_copies,
        available_copies,
        shelf_location,
        created_at,
        categories (
          id,
          name
        )
      `)
      .order('title', { ascending: true })

    // Apply search filters based on type
    switch (searchType) {
      case 'title':
        if (query) {
          booksQuery = booksQuery.ilike('title', `%${query}%`)
        }
        break

      case 'author':
        if (query) {
          booksQuery = booksQuery.ilike('author', `%${query}%`)
        }
        break

      case 'isbn':
        if (query) {
          booksQuery = booksQuery.eq('isbn', query)
        }
        break

      case 'category':
        if (categoryId) {
          booksQuery = booksQuery.eq('category_id', parseInt(categoryId))
        } else if (query) {
          // If searching by category name instead of ID
          const { data: categories } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', `%${query}%`)

          if (categories && categories.length > 0) {
            const categoryIds = categories.map(c => c.id)
            booksQuery = booksQuery.in('category_id', categoryIds)
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid search type. Use: title, author, isbn, or category' },
          { status: 400 }
        )
    }

    // Execute the query
    const { data: books, error: booksError } = await booksQuery

    if (booksError) {
      console.error('Database error:', booksError)
      return NextResponse.json(
        { error: 'Failed to search books' },
        { status: 500 }
      )
    }

    // For each book, get the available book copies
    const booksWithCopies = await Promise.all(
      (books || []).map(async (book) => {
        const { data: copies } = await supabase
          .from('book_copies')
          .select('id, book_copy_id, status')
          .eq('book_id', book.id)
          .neq('status', 'Removed')

        return {
          ...book,
          copies: copies || [],
          isAvailable: book.available_copies > 0,
          status: book.available_copies > 0 ? 'Available' : 'All Issued'
        }
      })
    )

    return NextResponse.json({
      success: true,
      count: booksWithCopies.length,
      data: booksWithCopies,
      searchType,
      query: query || categoryId
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET all categories (helper endpoint for category search)
export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { action } = body

    if (action === 'get-categories') {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch categories' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        data: categories
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}