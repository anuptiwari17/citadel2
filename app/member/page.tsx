// app/member/page.tsx
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import type { DashboardData } from '@/types/member';

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

async function getDashboardData(): Promise<DashboardData> {
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
    throw new Error('Failed to fetch dashboard data');
  }

  const result = await response.json();
  return result.data;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'blue' | 'purple' | 'green' | 'orange';
}

function StatsCard({ title, value, subtitle, color = 'blue' }: StatsCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  
  const cls = colors[color] || colors.blue;
  
  return (
    <div className={`rounded-2xl border p-6 ${cls}`}>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

function getStatusBadge(daysUntilDue: number, isOverdue: boolean) {
  if (isOverdue) {
    return {
      text: `${Math.abs(daysUntilDue)} Days Overdue`,
      className: 'bg-red-100 text-red-700 border-red-200'
    };
  }
  
  if (daysUntilDue === 0) {
    return {
      text: 'Due Today',
      className: 'bg-orange-100 text-orange-700 border-orange-200'
    };
  }
  
  if (daysUntilDue <= 3) {
    return {
      text: `${daysUntilDue} Days Left`,
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
  }
  
  if (daysUntilDue <= 7) {
    return {
      text: `${daysUntilDue} Days Left`,
      className: 'bg-blue-100 text-blue-700 border-blue-200'
    };
  }
  
  return {
    text: 'On Time',
    className: 'bg-green-100 text-green-700 border-green-200'
  };
}

export default async function MemberDashboard() {
  const user = await getUser();
  
  let dashboardData: DashboardData;
  
  try {
    dashboardData = await getDashboardData();
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    redirect('/login');
  }

  const { stats, borrowedBooks, userInfo } = dashboardData;

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
      
      <main className="ml-64 pt-24 px-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {userInfo.fullName}
            </h1>
            <p className="text-gray-600 mt-1">
              {userInfo.userType} • {userInfo.memberId}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatsCard 
              title="Books Borrowed" 
              value={stats.booksBorrowed}
              subtitle={`${stats.availableSlots} slot(s) available`}
              color="blue" 
            />
            <StatsCard 
              title="Due in Next 7 Days" 
              value={stats.dueInNext7Days}
              color="purple" 
            />
            <StatsCard 
              title="Total Fines" 
              value={`₹${stats.totalFines.toFixed(2)}`}
              color={stats.totalFines > 0 ? 'orange' : 'green'} 
            />
            <StatsCard 
              title="Borrow Limit" 
              value={`${stats.booksBorrowed}/${stats.borrowLimit}`}
              subtitle={userInfo.userType}
              color="green" 
            />
          </div>

          {/* Currently Borrowed Books */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-gray-900 font-bold">
                Currently Borrowed Books
              </h2>
              <span className="text-sm text-gray-500">
                {borrowedBooks.length} {borrowedBooks.length === 1 ? 'book' : 'books'}
              </span>
            </div>

            {borrowedBooks.length === 0 ? (
              <div className="text-center py-12">
                <svg 
                  className="mx-auto h-12 w-12 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                  />
                </svg>
                <p className="mt-4 text-gray-600 font-medium">No borrowed books</p>
                <p className="text-sm text-gray-500 mt-1">
                  Visit the library to borrow books
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {borrowedBooks.map((book) => {
                  const badge = getStatusBadge(book.daysUntilDue, book.isOverdue);
                  
                  return (
                    <div 
                      key={book.transactionId}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-5 px-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg 
                              className="w-5 h-5 text-blue-600" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{book.bookTitle}</p>
                            <p className="text-sm text-gray-600 mt-0.5">by {book.bookAuthor}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                              <span>ID: {book.bookCopyId}</span>
                              <span>•</span>
                              <span>Issued: {formatDate(book.issueDate)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col items-start sm:items-end gap-2">
                        <span 
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.className}`}
                        >
                          {badge.text}
                        </span>
                        <p className="text-xs text-gray-500">
                          Due: {formatDate(book.dueDate)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Warning Messages */}
          {stats.totalFines > 500 && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <svg 
                  className="w-5 h-5 text-red-600 flex-shrink-0" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                  />
                </svg>
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Your fine balance exceeds ₹500. You cannot borrow more books until you clear your dues.
                </p>
              </div>
            </div>
          )}

          {stats.booksBorrowed >= stats.borrowLimit && (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <svg 
                  className="w-5 h-5 text-orange-600 flex-shrink-0" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <p className="text-sm text-orange-800">
                  <strong>Borrowing Limit Reached:</strong> You have borrowed the maximum number of books ({stats.borrowLimit}). Please return a book to borrow more.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}