// app/librarian/page.tsx
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import StatsCard from '../components/dashboard/StatsCard';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

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
    if (user.role !== 'Librarian') redirect('/member');
    return user;
  } catch {
    redirect('/login');
  }
}

export default async function LibrarianDashboard() {
  const user = await getUser();

  return (
    <>
      <Sidebar role="Librarian" />
      <Header user={{ name: user.fullName || 'Librarian', role: 'Librarian', memberId: user.memberId || '' }} />

      <main className="ml-64 pt-24 px-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Librarian Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatsCard title="Books Issued Today" value="18" color="blue" />
            <StatsCard title="Books Returned" value="14" color="green" />
            <StatsCard title="Pending Returns" value="9" color="red" />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Issue Book */}
            <a href="/librarian/issue" className="bg-white p-10 rounded-2xl border-2 border-gray-300 hover:border-gray-900 transition text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white">→</span>
              </div>
              <h3 className="text-xl text-black font-bold">Issue Book</h3>
              <p className="text-gray-600 mt-2">Lend book to member</p>
            </a>

            {/* Return Book */}
            <a href="/librarian/return" className="bg-white p-10 rounded-2xl border-2 border-gray-300 hover:border-gray-900 transition text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-white">←</span>
              </div>
              <h3 className="text-xl text-black font-bold">Return Book</h3>
              <p className="text-gray-600 mt-2">Accept returned book</p>
            </a>

          
          </div>
        </div>
      </main>
    </>
  );
}