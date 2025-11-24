// app/api/books/add/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireRole } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Only Admin and Librarian can add books
    const user = await requireRole(['Admin', 'Librarian'])

    const body = await req.json()
    const {
      title,
      author,
      isbn,
      publisher,
      publicationYear,
      categoryId,
      numberOfCopies,
      shelfLocation
    } = body

    // Validation
    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Book title is required' },
        { status: 400 }
      )
    }

    if (title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 200 characters or less' },
        { status: 400 }
      )
    }

    if (!author || author.trim().length === 0) {
      return NextResponse.json(
        { error: 'Author name is required' },
        { status: 400 }
      )
    }

    if (!publisher || publisher.trim().length === 0) {
      return NextResponse.json(
        { error: 'Publisher is required' },
        { status: 400 }
      )
    }

    const currentYear = new Date().getFullYear()
    if (!publicationYear || publicationYear < 1900 || publicationYear > currentYear) {
      return NextResponse.json(
        { error: `Publication year must be between 1900 and ${currentYear}` },
        { status: 400 }
      )
    }

    if (!numberOfCopies || numberOfCopies < 1 || numberOfCopies > 100) {
      return NextResponse.json(
        { error: 'Number of copies must be between 1 and 100' },
        { status: 400 }
      )
    }

    // Validate ISBN if provided
    if (isbn && isbn.trim().length > 0) {
      const cleanISBN = isbn.replace(/[-\s]/g, '')
      if (cleanISBN.length !== 10 && cleanISBN.length !== 13) {
        return NextResponse.json(
          { error: 'ISBN must be 10 or 13 digits' },
          { status: 400 }
        )
      }

      // Check if ISBN already exists
      const { data: existingBook } = await supabase
        .from('books')
        .select('id')
        .eq('isbn', cleanISBN)
        .single()

      if (existingBook) {
        return NextResponse.json(
          { error: 'A book with this ISBN already exists' },
          { status: 400 }
        )
      }
    }

    // Validate category if provided
    if (categoryId) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('id', categoryId)
        .single()

      if (!category) {
        return NextResponse.json(
          { error: 'Invalid category selected' },
          { status: 400 }
        )
      }
    }

    // Insert the book
    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({
        title: title.trim(),
        author: author.trim(),
        isbn: isbn && isbn.trim().length > 0 ? isbn.replace(/[-\s]/g, '') : null,
        publisher: publisher.trim(),
        publication_year: publicationYear,
        category_id: categoryId || null,
        total_copies: numberOfCopies,
        available_copies: numberOfCopies,
        shelf_location: shelfLocation && shelfLocation.trim().length > 0 ? shelfLocation.trim() : null
      })
      .select()
      .single()

    if (bookError) {
      console.error('Book insert error:', bookError)
      return NextResponse.json(
        { error: 'Failed to add book to database' },
        { status: 500 }
      )
    }

    // Generate book copy IDs
    const currentYearShort = new Date().getFullYear()
    const bookCopies = []
    const createdCopyIds = []

    // Get the latest book copy number for this year
    const { data: latestCopy } = await supabase
      .from('book_copies')
      .select('book_copy_id')
      .like('book_copy_id', `BK-${currentYearShort}-%`)
      .order('id', { ascending: false })
      .limit(1)
      .single()

    let startNumber = 1
    if (latestCopy && latestCopy.book_copy_id) {
      const match = latestCopy.book_copy_id.match(/BK-\d+-(\d+)-/)
      if (match) {
        startNumber = parseInt(match[1]) + 1
      }
    }

    // Create book copies
    for (let i = 0; i < numberOfCopies; i++) {
      const copyNumber = i + 1
      const bookCopyId = `BK-${currentYearShort}-${String(startNumber).padStart(4, '0')}-${String(copyNumber).padStart(2, '0')}`
      
      bookCopies.push({
        book_id: book.id,
        copy_number: copyNumber,
        book_copy_id: bookCopyId,
        status: 'Available'
      })

      createdCopyIds.push(bookCopyId)
    }

    const { error: copiesError } = await supabase
      .from('book_copies')
      .insert(bookCopies)

    if (copiesError) {
      console.error('Book copies insert error:', copiesError)
      // Rollback: delete the book
      await supabase.from('books').delete().eq('id', book.id)
      return NextResponse.json(
        { error: 'Failed to create book copies' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: parseInt(user.id),
      action: 'ADD_BOOK',
      description: `Added book: ${title} (${numberOfCopies} copies)`,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      message: `Successfully added "${title}" with ${numberOfCopies} ${numberOfCopies === 1 ? 'copy' : 'copies'}`,
      data: {
        bookId: book.id,
        title: book.title,
        copyIds: createdCopyIds
      }
    })

  } catch (error) {
    console.error('Add book error:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'You do not have permission to add books' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch categories for the form
export async function GET() {
  try {
    const user = await requireRole(['Admin', 'Librarian'])

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

  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}