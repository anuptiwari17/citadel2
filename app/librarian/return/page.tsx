// app/librarian/return/page.tsx
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import ReturnBookForm from '../../components/books/ReturnBookForm';
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

export default async function ReturnBookPage() {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Return Book</h1>
            <p className="text-gray-600">Process book returns and calculate fines</p>
          </div>

          <ReturnBookForm />
        </div>
      </main>
    </>
  );
}