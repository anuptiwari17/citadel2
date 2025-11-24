// app/librarian/issue/page.tsx
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import IssueBookForm from '../../components/books/IssueBookForm';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getUser() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get('citadel-auth')?.value;
  if (!token) redirect('/login');
  try {
    interface UserPayload {
      role?: string;
      fullName?: string;
      memberId?: string;
    }
    const user = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    if (user.role !== 'Librarian' && user.role !== 'Admin') redirect('/member');
    return user;
  } catch {
    redirect('/login');
  }
}

export default async function IssueBookPage() {
  const user = await getUser();

  return (
    <>
      <Sidebar role={user.role === 'Admin' ? 'Admin' : 'Librarian'} />
      <Header user={{ 
        name: user.fullName || 'User', 
        role: user.role || 'User', 
        memberId: user.memberId || '' 
      }} />

      <main className="ml-64 pt-24 px-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Link 
            href="/librarian"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Issue Book</h1>
            <p className="text-gray-600">Lend a book to a library member</p>
          </div>

          <IssueBookForm />

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-2">👥 Students</h3>
              <p className="text-sm text-blue-800">
                Can borrow up to <strong>3 books</strong> for <strong>14 days</strong>
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="font-bold text-purple-900 mb-2">👨‍🏫 Faculty</h3>
              <p className="text-sm text-purple-800">
                Can borrow up to <strong>5 books</strong> for <strong>30 days</strong>
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h3 className="font-bold text-red-900 mb-2">⚠️ Fine Limit</h3>
              <p className="text-sm text-red-800">
                Members with fines <strong>&gt; ₹500</strong> cannot borrow books
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}