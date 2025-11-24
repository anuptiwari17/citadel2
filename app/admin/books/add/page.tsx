// app/admin/books/add/page.tsx
import Sidebar from '../../../components/dashboard/Sidebar';
import Header from '../../../components/dashboard/Header';
import AddBookForm from '../../../components/books/AddBookForm';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getUser() {
  const token = (await cookies()).get('citadel-auth')?.value;
  if (!token) redirect('/login');

  try {
    interface UserPayload extends JwtPayload {
      role?: string;
      fullName?: string;
      memberId?: string;
    }

    const user = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    if (user.role !== 'Admin' && user.role !== 'Librarian') redirect('/member');
    return user;
  } catch {
    redirect('/login');
  }
}

export default async function AddBookPage() {
  const user = await getUser();

  return (
    <>
      <Sidebar role={user.role === 'Admin' ? 'Admin' : 'Librarian'} />
      <Header user={{ 
        name: user.fullName || 'User', 
        role: user.role || 'User', 
        memberId: user.memberId ?? '' 
      }} />

      <main className="ml-64 pt-24 px-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <Link 
            href={user.role === 'Admin' ? '/admin' : '/librarian'}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Book</h1>
            <p className="text-gray-600">Add a new book to the library catalog with multiple copies</p>
          </div>

          <AddBookForm />

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-2">📚 Book Copies</h3>
              <p className="text-sm text-blue-800">
                Each copy gets a unique ID like BK-2025-0001-01. You can add 1-100 copies at once.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <h3 className="font-bold text-purple-900 mb-2">🔢 ISBN Format</h3>
              <p className="text-sm text-purple-800">
                ISBN can be 10 or 13 digits. Hyphens and spaces are automatically removed.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-bold text-green-900 mb-2">✅ Auto Available</h3>
              <p className="text-sm text-green-800">
                All copies are marked as &#34;Available&#34; immediately after adding.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}