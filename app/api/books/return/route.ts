// app/api/books/return/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireRole } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Only Admin and Librarian can process returns
    const user = await requireRole(['Admin', 'Librarian'])

    const body = await req.json()
    const { bookCopyId } = body

    // Validation
    if (!bookCopyId) {
      return NextResponse.json(
        { error: 'Book Copy ID is required' },
        { status: 400 }
      )
    }

    // 1. Find the book copy first
    const { data: bookCopy, error: bookCopyError } = await supabase
      .from('book_copies')
      .select('id, book_copy_id, book_id')
      .eq('book_copy_id', bookCopyId)
      .single()

    if (bookCopyError || !bookCopy) {
      return NextResponse.json(
        { error: 'Book copy not found' },
        { status: 404 }
      )
    }

    // 2. Find the active transaction for this book copy
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .select('id, transaction_id, user_id, book_copy_id, issue_date, due_date, fine_amount')
      .eq('book_copy_id', bookCopy.id)
      .eq('status', 'Issued')
      .single()

    if (txnError || !transaction) {
      return NextResponse.json(
        { error: 'No active transaction found for this book copy. Book may not be issued.' },
        { status: 404 }
      )
    }

    // 3. Get user details
    const { data: userDetails } = await supabase
      .from('users')
      .select('id, member_id, full_name, total_fine')
      .eq('id', transaction.user_id)
      .single()

    // 4. Get book details
    const { data: bookDetails } = await supabase
      .from('books')
      .select('id, title, author, available_copies, total_copies')
      .eq('id', bookCopy.book_id)
      .single()

    if (!userDetails || !bookDetails) {
      return NextResponse.json(
        { error: 'Failed to fetch transaction details' },
        { status: 500 }
      )
    }

    // 5. Calculate fine if overdue
    const returnDate = new Date()
    const dueDate = new Date(transaction.due_date)
    const isLate = returnDate > dueDate

    let fineAmount = 0
    let daysLate = 0

    if (isLate) {
      const timeDiff = returnDate.getTime() - dueDate.getTime()
      daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      fineAmount = daysLate * 5 // ₹5 per day
    }

    // 6. Update transaction
    const { error: updateTxnError } = await supabase
      .from('transactions')
      .update({
        return_date: returnDate.toISOString().split('T')[0],
        returned_to: parseInt(user.id),
        fine_amount: fineAmount,
        status: isLate ? 'Overdue' : 'Returned',
        fine_paid: false
      })
      .eq('id', transaction.id)

    if (updateTxnError) {
      console.error('Update transaction error:', updateTxnError)
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      )
    }

    // 7. Update book copy status to Available
    const { error: updateCopyError } = await supabase
      .from('book_copies')
      .update({ status: 'Available' })
      .eq('id', bookCopy.id)

    if (updateCopyError) {
      console.error('Update book copy error:', updateCopyError)
      return NextResponse.json(
        { error: 'Failed to update book copy status' },
        { status: 500 }
      )
    }

    // 8. Update book available copies count (increment by 1)
    const newAvailableCopies = Math.min(
      (bookDetails.available_copies || 0) + 1, 
      bookDetails.total_copies || 0
    )
    
    await supabase
      .from('books')
      .update({ available_copies: newAvailableCopies })
      .eq('id', bookDetails.id)

    // 9. If there's a fine, create fine record and update user's total fine
    if (fineAmount > 0) {
      // Create fine record
      await supabase.from('fines').insert({
        transaction_id: transaction.id,
        user_id: transaction.user_id,
        amount: fineAmount,
        reason: 'Late Return',
        paid: false
      })

      // Update user's total fine
      const newTotalFine = (userDetails.total_fine || 0) + fineAmount
      await supabase
        .from('users')
        .update({ total_fine: newTotalFine })
        .eq('id', transaction.user_id)
    }

    // 10. Log the action
    await supabase.from('audit_logs').insert({
      user_id: parseInt(user.id),
      action: 'RETURN_BOOK',
      description: `Returned ${bookDetails.title} (${bookCopyId}) from ${userDetails.full_name}${isLate ? ` - ${daysLate} days late, fine: ₹${fineAmount}` : ''}`,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      message: isLate 
        ? `Book returned successfully. Late by ${daysLate} day(s). Fine: ₹${fineAmount}`
        : 'Book returned successfully. No fine.',
      data: {
        transactionId: transaction.transaction_id,
        bookTitle: bookDetails.title,
        bookAuthor: bookDetails.author,
        memberName: userDetails.full_name,
        memberId: userDetails.member_id,
        issueDate: transaction.issue_date,
        dueDate: transaction.due_date,
        returnDate: returnDate.toISOString().split('T')[0],
        isLate,
        daysLate,
        fineAmount,
        status: isLate ? 'Overdue' : 'Returned'
      }
    })

  } catch (error) {
    console.error('Return book error:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'You do not have permission to process returns' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check book status before return
export async function GET(req: NextRequest) {
  try {
    await requireRole(['Admin', 'Librarian'])

    const { searchParams } = new URL(req.url)
    const bookCopyId = searchParams.get('bookCopyId')

    if (!bookCopyId) {
      return NextResponse.json(
        { error: 'Book Copy ID is required' },
        { status: 400 }
      )
    }

    // Find book copy
    const { data: bookCopy, error: bookCopyError } = await supabase
      .from('book_copies')
      .select('id, book_copy_id, book_id')
      .eq('book_copy_id', bookCopyId)
      .single()

    if (bookCopyError || !bookCopy) {
      return NextResponse.json(
        { error: 'Book copy not found' },
        { status: 404 }
      )
    }

    // Find active transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('id, transaction_id, user_id, issue_date, due_date')
      .eq('book_copy_id', bookCopy.id)
      .eq('status', 'Issued')
      .single()

    if (error || !transaction) {
      return NextResponse.json(
        { error: 'No active transaction found for this book copy' },
        { status: 404 }
      )
    }

    // Get user details
    const { data: userDetails } = await supabase
      .from('users')
      .select('member_id, full_name, user_type')
      .eq('id', transaction.user_id)
      .single()

    // Get book details
    const { data: bookDetails } = await supabase
      .from('books')
      .select('title, author')
      .eq('id', bookCopy.book_id)
      .single()

    if (!userDetails || !bookDetails) {
      return NextResponse.json(
        { error: 'Failed to fetch details' },
        { status: 500 }
      )
    }

    // Calculate potential fine
    const today = new Date()
    const dueDate = new Date(transaction.due_date)
    const isLate = today > dueDate

    let daysLate = 0
    let potentialFine = 0

    if (isLate) {
      const timeDiff = today.getTime() - dueDate.getTime()
      daysLate = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      potentialFine = daysLate * 5
    }

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.transaction_id,
        bookTitle: bookDetails.title,
        bookAuthor: bookDetails.author,
        memberName: userDetails.full_name,
        memberId: userDetails.member_id,
        userType: userDetails.user_type,
        issueDate: transaction.issue_date,
        dueDate: transaction.due_date,
        isLate,
        daysLate,
        potentialFine
      }
    })

  } catch (error) {
    console.error('Check return error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}