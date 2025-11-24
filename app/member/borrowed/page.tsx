// app/member/borrowed/page.tsx
import Sidebar from '@/app/components/dashboard/Sidebar';
import Header from '@/app/components/dashboard/Header';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import type { DashboardData, BorrowedBook } from '@/types/member';

interface UserPayload {
  id: string;
  memberId: string;
  fullName?: string;
  role: 'Faculty' | 'Student' | string;
}

async function getUser(): Promise<UserPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get('citadel-auth')?.value;
  
  if (!token) redirect('/login');
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    return payload;
  } catch {
    redirect('/login');
  }
}

async function getBorrowedBooks(): Promise<DashboardData> {
  const cookieStore = await cookies();
  const token = cookieStore.get('citadel-auth')?.value;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const response = await fetch(`${baseUrl}/api/member/dashboard`, {
    headers: {
      'Cookie': `citadel-auth=${token}`
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch borrowed books');
  }

  const result = await response.json();
  return result.data;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: '2-digit',
    month: 'short', 
    year: 'numeric' 
  });
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    weekday: 'long',
    day: 'numeric',
    month: 'long', 
    year: 'numeric' 
  });
}

function getStatusInfo(daysUntilDue: number, isOverdue: boolean) {
  if (isOverdue) {
    return {
      text: `${Math.abs(daysUntilDue)} ${Math.abs(daysUntilDue) === 1 ? 'Day' : 'Days'} Overdue`,
      badge: 'bg-red-500 text-white',
      icon: 'text-red-500',
      bg: 'bg-red-50 border-red-200'
    };
  }
  
  if (daysUntilDue === 0) {
    return {
      text: 'Due Today',
      badge: 'bg-orange-500 text-white',
      icon: 'text-orange-500',
      bg: 'bg-orange-50 border-orange-200'
    };
  }
  
  if (daysUntilDue === 1) {
    return {
      text: 'Due Tomorrow',
      badge: 'bg-yellow-500 text-white',
      icon: 'text-yellow-500',
      bg: 'bg-yellow-50 border-yellow-200'
    };
  }
  
  if (daysUntilDue <= 3) {
    return {
      text: `${daysUntilDue} Days Left`,
      badge: 'bg-yellow-500 text-white',
      icon: 'text-yellow-500',
      bg: 'bg-yellow-50 border-yellow-200'
    };
  }
  
  if (daysUntilDue <= 7) {
    return {
      text: `${daysUntilDue} Days Left`,
      badge: 'bg-blue-500 text-white',
      icon: 'text-blue-500',
      bg: 'bg-blue-50 border-blue-200'
    };
  }
  
  return {
    text: `${daysUntilDue} Days Left`,
    badge: 'bg-green-500 text-white',
    icon: 'text-green-500',
    bg: 'bg-green-50 border-green-200'
  };
}

interface BookCardProps {
  book: BorrowedBook;
  index: number;
}

function BookCard({ book, index }: BookCardProps) {
  const status = getStatusInfo(book.daysUntilDue, book.isOverdue);
  
  return (
    <div className={`rounded-xl border-2 p-6 transition-all hover:shadow-lg ${status.bg}`}>
      {/* Header with Book Number and Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-200">
            <span className="text-lg font-bold text-gray-700">#{index + 1}</span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Book Copy ID</p>
            <p className="text-sm font-mono font-semibold text-gray-900">{book.bookCopyId}</p>
          </div>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${status.badge} shadow-sm`}>
          {status.text}
        </span>
      </div>

      {/* Book Details */}
      <div className="space-y-4">
        {/* Title and Author */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
            {book.bookTitle}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {book.bookAuthor}
          </p>
        </div>

        {/* Transaction Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-white">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Transaction ID</p>
            <p className="text-sm font-mono font-semibold text-gray-900">{book.transactionId}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Status</p>
            <p className="text-sm font-semibold text-gray-900">{book.status}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t-2 border-white">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Issued On</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(book.issueDate)}</p>
              <p className="text-xs text-gray-600 mt-0.5">{formatFullDate(book.issueDate)}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <svg className={`w-5 h-5 ${status.icon} mt-0.5 flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Due Date</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(book.dueDate)}</p>
              <p className="text-xs text-gray-600 mt-0.5">{formatFullDate(book.dueDate)}</p>
            </div>
          </div>
        </div>

        {/* Overdue Warning */}
        {book.isOverdue && (
          <div className="mt-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-red-900">Overdue!</p>
                <p className="text-xs text-red-800 mt-0.5">
                  Please return this book as soon as possible. You will be charged ₹5 per day for late returns.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Due Soon Warning */}
        {!book.isOverdue && book.daysUntilDue <= 3 && (
          <div className="mt-4 p-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-yellow-900">Due Soon!</p>
                <p className="text-xs text-yellow-800 mt-0.5">
                  This book is due in {book.daysUntilDue} {book.daysUntilDue === 1 ? 'day' : 'days'}. Please plan to return it on time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function BorrowedBooksPage() {
  const user = await getUser();
  
  let dashboardData: DashboardData;
  
  try {
    dashboardData = await getBorrowedBooks();
  } catch (error) {
    console.error('Error fetching borrowed books:', error);
    redirect('/login');
  }

  const { borrowedBooks, userInfo, stats } = dashboardData;

  // Sort books: overdue first, then by due date
  const sortedBooks = [...borrowedBooks].sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const overdueCount = borrowedBooks.filter(book => book.isOverdue).length;
  const dueSoonCount = borrowedBooks.filter(book => !book.isOverdue && book.daysUntilDue <= 3).length;

  return (
    <>
      <Sidebar role={user.role === 'Faculty' ? 'Faculty' : 'Student'} />
      <Header 
        user={{ 
          name: user.fullName || 'Member', 
          role: user.role, 
          memberId: user.memberId 
        }} 
      />
      
      <main className="ml-64 pt-24 px-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900">My Borrowed Books</h1>
            </div>
            <p className="text-gray-600">
              {userInfo.fullName} • {userInfo.memberId} • {userInfo.userType}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border-2 border-blue-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Books</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.booksBorrowed}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-red-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{overdueCount}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-yellow-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Due Soon</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">{dueSoonCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-green-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Slots</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.availableSlots}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Books List */}
          {borrowedBooks.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center shadow-lg">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Books Borrowed</h3>
                <p className="text-gray-600 mb-6">
                  You haven&#34;t borrowed any books yet. Visit the library to explore our collection and borrow books.
                </p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Your Borrowing Limit:</strong> {stats.borrowLimit} books ({userInfo.userType})
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <strong>{borrowedBooks.length}</strong> of <strong>{stats.borrowLimit}</strong> books
                </p>
                <p className="text-sm text-gray-600">
                  Sorted by: <strong>Due Date</strong>
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedBooks.map((book, index) => (
                  <BookCard key={book.transactionId} book={book} index={index} />
                ))}
              </div>
            </>
          )}

          {/* Fine Warning */}
          {stats.totalFines > 0 && (
            <div className="mt-8 bg-orange-50 border-2 border-orange-300 rounded-xl p-6 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-orange-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-orange-900 mb-2">Outstanding Fines</h3>
                  <p className="text-sm text-orange-800 mb-3">
                    You have a total fine of <strong>₹{stats.totalFines.toFixed(2)}</strong>. 
                    {stats.totalFines > 500 && (
                      <span className="block mt-1 font-semibold">
                        ⚠️ Your fine exceeds ₹500. You cannot borrow more books until you clear your dues.
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-orange-700">
                    Please visit the library counter to pay your fines. Fine rate: ₹5 per day for late returns.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}