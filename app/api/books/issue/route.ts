// app/api/books/issue/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { requireRole } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Only Admin and Librarian can issue books
    const user = await requireRole(['Admin', 'Librarian'])

    const body = await req.json()
    const { memberId, bookCopyId } = body

    // Validation
    if (!memberId || !bookCopyId) {
      return NextResponse.json(
        { error: 'Member ID and Book Copy ID are required' },
        { status: 400 }
      )
    }

    // 1. Check if member exists and is active
    const { data: member, error: memberError } = await supabase
      .from('users')
      .select('id, member_id, full_name, user_type, total_fine, is_active, is_blocked')
      .eq('member_id', memberId)
      .single()

    if (memberError || !member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
    }

    if (!member.is_active) {
      return NextResponse.json(
        { error: 'Member account is inactive' },
        { status: 400 }
      )
    }

    if (member.is_blocked) {
      return NextResponse.json(
        { error: 'Member account is blocked' },
        { status: 400 }
      )
    }

    // 2. Check if total fines exceed ₹500
    if (member.total_fine > 500) {
      return NextResponse.json(
        { error: `Member has outstanding fines of ₹${member.total_fine}. Cannot issue books until fines are below ₹500.` },
        { status: 400 }
      )
    }

    // 3. Check borrowing limit
    const borrowLimit = member.user_type === 'Faculty' ? 5 : 3
    const { data: currentBorrowings, error: borrowError } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', member.id)
      .eq('status', 'Issued')

    if (borrowError) {
      return NextResponse.json(
        { error: 'Failed to check borrowing limit' },
        { status: 500 }
      )
    }

    if (currentBorrowings && currentBorrowings.length >= borrowLimit) {
      return NextResponse.json(
        { error: `Member has reached borrowing limit (${borrowLimit} books for ${member.user_type})` },
        { status: 400 }
      )
    }

    // 4. Check if book copy exists and is available
    const { data: bookCopy, error: copyError } = await supabase
      .from('book_copies')
      .select(`
        id,
        book_copy_id,
        status,
        book_id
      `)
      .eq('book_copy_id', bookCopyId)
      .single()

    if (copyError || !bookCopy) {
      return NextResponse.json(
        { error: 'Book copy not found' },
        { status: 404 }
      )
    }

    if (bookCopy.status !== 'Available') {
      return NextResponse.json(
        { error: `Book copy is ${bookCopy.status.toLowerCase()}. Cannot issue.` },
        { status: 400 }
      )
    }

    // Get book details
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, title, author, available_copies, total_copies')
      .eq('id', bookCopy.book_id)
      .single()

    if (bookError || !book) {
      return NextResponse.json(
        { error: 'Book details not found' },
        { status: 404 }
      )
    }

    // 5. Calculate due date
    const borrowPeriod = member.user_type === 'Faculty' ? 30 : 14
    const issueDate = new Date()
    const dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + borrowPeriod)

    // 6. Generate transaction ID
    const year = new Date().getFullYear()
    const { data: latestTxn } = await supabase
      .from('transactions')
      .select('transaction_id')
      .like('transaction_id', `TXN-${year}-%`)
      .order('id', { ascending: false })
      .limit(1)
      .single()

    let txnNumber = 1
    if (latestTxn && latestTxn.transaction_id) {
      const match = latestTxn.transaction_id.match(/TXN-\d+-(\d+)/)
      if (match) {
        txnNumber = parseInt(match[1]) + 1
      }
    }

    const transactionId = `TXN-${year}-${String(txnNumber).padStart(6, '0')}`

    // 7. Create transaction
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .insert({
        transaction_id: transactionId,
        user_id: member.id,
        book_copy_id: bookCopy.id,
        issue_date: issueDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        issued_by: parseInt(user.id),
        status: 'Issued',
        fine_amount: 0,
        fine_paid: false
      })
      .select()
      .single()

    if (txnError) {
      console.error('Transaction error:', txnError)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // 8. Update book copy status
    const { error: updateCopyError } = await supabase
      .from('book_copies')
      .update({ status: 'Issued' })
      .eq('id', bookCopy.id)

    if (updateCopyError) {
      // Rollback transaction
      await supabase.from('transactions').delete().eq('id', transaction.id)
      return NextResponse.json(
        { error: 'Failed to update book status' },
        { status: 500 }
      )
    }

    // 9. Update book available copies count (decrement by 1)
    const { error: updateBookError } = await supabase
      .from('books')
      .update({ 
        available_copies: Math.max((book.available_copies || 0) - 1, 0) 
      })
      .eq('id', book.id)

    if (updateBookError) {
      console.error('Update book error:', updateBookError)
      // Continue anyway, this can be fixed manually
    }

    // 10. Log the action
    await supabase.from('audit_logs').insert({
      user_id: parseInt(user.id),
      action: 'ISSUE_BOOK',
      description: `Issued ${book.title} (${bookCopyId}) to ${member.full_name} (${memberId})`,
      ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    })

    return NextResponse.json({
      success: true,
      message: 'Book issued successfully',
      data: {
        transactionId: transaction.transaction_id,
        bookTitle: book.title,
        bookAuthor: book.author,
        memberName: member.full_name,
        memberId: member.member_id,
        issueDate: issueDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        borrowPeriod: `${borrowPeriod} days`
      }
    })

  } catch (error) {
    console.error('Issue book error:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json(
        { error: 'You do not have permission to issue books' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to verify member/book before issuing
export async function GET(req: NextRequest) {
  try {
    await requireRole(['Admin', 'Librarian'])

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'member' or 'book'
    const query = searchParams.get('query')

    if (!type || !query) {
      return NextResponse.json(
        { error: 'Type and query are required' },
        { status: 400 }
      )
    }

    if (type === 'member') {
      const { data: member, error } = await supabase
        .from('users')
        .select('id, member_id, full_name, user_type, total_fine, is_active, is_blocked')
        .eq('member_id', query)
        .single()

      if (error || !member) {
        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        )
      }

      // Get current borrowed books count
      const { data: borrowings } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', member.id)
        .eq('status', 'Issued')

      const borrowLimit = member.user_type === 'Faculty' ? 5 : 3
      const canBorrow = (borrowings?.length || 0) < borrowLimit && 
                       member.total_fine <= 500 && 
                       member.is_active && 
                       !member.is_blocked

      return NextResponse.json({
        success: true,
        data: {
          ...member,
          currentBorrowings: borrowings?.length || 0,
          borrowLimit,
          canBorrow,
          reason: !canBorrow 
            ? (member.total_fine > 500 ? 'High fines' : 
               !member.is_active ? 'Inactive account' :
               member.is_blocked ? 'Blocked account' : 
               'Borrowing limit reached')
            : null
        }
      })
    }

    if (type === 'book') {
      const { data: bookCopy, error } = await supabase
        .from('book_copies')
        .select('id, book_copy_id, status, book_id')
        .eq('book_copy_id', query)
        .single()

      if (error || !bookCopy) {
        return NextResponse.json(
          { error: 'Book copy not found' },
          { status: 404 }
        )
      }

      // Get book details separately
      const { data: book } = await supabase
        .from('books')
        .select('id, title, author, isbn, publisher, shelf_location')
        .eq('id', bookCopy.book_id)
        .single()

      return NextResponse.json({
        success: true,
        data: {
          ...bookCopy,
          books: book || {},
          canIssue: bookCopy.status === 'Available'
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid type. Use "member" or "book"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}