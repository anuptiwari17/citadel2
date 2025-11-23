// app/admin/page.tsx
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import StatsCard from '../components/dashboard/StatsCard';
import DashboardBookSearch from '../components/books/DashboardBookSearch';  // ← NEW
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redirect } from 'next/navigation';

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
    if (user.role !== 'Admin') redirect('/member');
    return user;
  } catch {
    redirect('/login');
  }
}

export default async function AdminDashboard() {
  const user = await getUser();

  // Real stats will come later — for now mock (replace soon)
  const stats = { totalBooks: 8421, totalMembers: 1203, overdue: 27, totalFines: 18450 };

  return (
    <>
      <Sidebar role="Admin" />
      <Header user={{ name: user.fullName || 'Admin', role: 'Administrator', memberId: user.memberId ?? '' }} />

      <main className="ml-64 pt-24 px-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatsCard title="Total Books" value={stats.totalBooks} color="blue" />
            <StatsCard title="Total Members" value={stats.totalMembers} color="purple" />
            <StatsCard title="Overdue Books" value={stats.overdue} color="red" />
            <StatsCard title="Pending Fines (₹)" value={stats.totalFines} color="green" />
          </div>

          {/* MAIN CONTENT GRID — NOW 3 COLUMNS ON LARGE SCREENS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <a href="/admin/books/add" className="p-5 bg-gray-900 text-white rounded-xl text-center font-medium hover:bg-gray-800 transition">Add New Book</a>
                <a href="/admin/users/add" className="p-5 border-2 border-gray-300 rounded-xl text-center font-medium hover:border-gray-900 transition">Add Librarian</a>
                <a href="/admin/reports" className="p-5 border-2 border-gray-300 rounded-xl text-center font-medium hover:border-gray-900 transition">View Reports</a>
                <a href="/admin/overdue" className="p-5 bg-red-600 text-white rounded-xl text-center font-medium hover:bg-red-700 transition">Overdue List</a>
              </div>
            </div>

            {/* MIDDLE: Live Book Search */}
            <div className="lg:col-span-1">
              <DashboardBookSearch />
            </div>

            {/* RIGHT: Recent Activity */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <p>→ Book &#34;Database Systems&#34; issued to Anshuman</p>
                <p>→ Fine collected ₹50 from Rahul</p>
                <p>→ New member registered: anoop.it.24@nitj.ac.in</p>
                <p>→ Book &#34;OS Concepts&#34; returned (3 days late)</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}