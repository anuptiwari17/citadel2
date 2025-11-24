// app/api/member/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

interface JWTPayload {
  id: string;
  memberId: string;
  fullName: string;
  role: string;
  userType: string;
}

interface BorrowedBook {
  transactionId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCopyId: string;
  issueDate: string;
  dueDate: string;
  status: string;
  daysUntilDue: number;
  isOverdue: boolean;
}

interface DashboardStats {
  booksBorrowed: number;
  dueInNext7Days: number;
  totalFines: number;
  borrowLimit: number;
  availableSlots: number;
}

interface DashboardData {
  stats: DashboardStats;
  borrowedBooks: BorrowedBook[];
  userInfo: {
    memberId: string;
    fullName: string;
    userType: string;
    totalFine: number;
  };
}

async function verifyAuth(req: NextRequest): Promise<JWTPayload> {
  const cookieStore = await cookies()
  const token = cookieStore.get('citadel-auth')?.value

  if (!token) {
    throw new Error('Unauthorized')
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    return payload
  } catch {
    throw new Error('Unauthorized')
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyAuth(req)

    // 1. Get user details from database
    const { data: userDetails, error: userError } = await supabase
      .from('users')
      .select('id, member_id, full_name, user_type, total_fine, is_active')
      .eq('id', parseInt(user.id))
      .single()

    if (userError || !userDetails) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!userDetails.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      )
    }

    // 2. Get all currently borrowed books with book details
    const { data: transactions, error: txnError } = await supabase
      .from('transactions')
      .select(`
        id,
        transaction_id,
        issue_date,
        due_date,
        status,
        fine_amount,
        book_copy_id,
        book_copies!inner (
          book_copy_id,
          books!inner (
            title,
            author
          )
        )
      `)
      .eq('user_id', parseInt(user.id))
      .eq('status', 'Issued')
      .order('due_date', { ascending: true })

    if (txnError) {
      console.error('Transaction error:', txnError)
      return NextResponse.json(
        { error: 'Failed to fetch borrowed books' },
        { status: 500 }
      )
    }

    // 3. Process borrowed books data
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const borrowedBooks: BorrowedBook[] = (transactions || []).map((txn) => {
      const dueDate = new Date(txn.due_date)
      dueDate.setHours(0, 0, 0, 0)
      
      const timeDiff = dueDate.getTime() - today.getTime()
      const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))
      const isOverdue = daysUntilDue < 0

      // Type assertion for nested data
      const bookCopy = txn.book_copies as unknown as {
        book_copy_id: string;
        books: { title: string; author: string };
      }

      return {
        transactionId: txn.transaction_id,
        bookTitle: bookCopy.books.title,
        bookAuthor: bookCopy.books.author,
        bookCopyId: bookCopy.book_copy_id,
        issueDate: txn.issue_date,
        dueDate: txn.due_date,
        status: txn.status,
        daysUntilDue,
        isOverdue
      }
    })

    // 4. Calculate statistics
    const booksBorrowed = borrowedBooks.length
    const dueInNext7Days = borrowedBooks.filter(
      book => book.daysUntilDue >= 0 && book.daysUntilDue <= 7
    ).length

    const borrowLimit = userDetails.user_type === 'Faculty' ? 5 : 3
    const availableSlots = borrowLimit - booksBorrowed

    const stats: DashboardStats = {
      booksBorrowed,
      dueInNext7Days,
      totalFines: parseFloat(userDetails.total_fine || '0'),
      borrowLimit,
      availableSlots
    }

    // 5. Prepare response data
    const dashboardData: DashboardData = {
      stats,
      borrowedBooks,
      userInfo: {
        memberId: userDetails.member_id,
        fullName: userDetails.full_name,
        userType: userDetails.user_type,
        totalFine: parseFloat(userDetails.total_fine || '0')
      }
    }

    return NextResponse.json({
      success: true,
      data: dashboardData
    })

  } catch (error) {
    console.error('Dashboard API error:', error)

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}