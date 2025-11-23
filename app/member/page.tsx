// app/member/page.tsx
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import DashboardBookSearch from '../components/books/DashboardBookSearch'; // ← NEW
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

interface UserPayload {
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

interface StatsCardProps {
  title: string;
  value: string | number;
  color?: 'blue' | 'purple' | 'green';
}

function StatsCard({ title, value, color = 'blue' }: StatsCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    green: 'bg-green-50 text-green-700',
  };
  const cls = colors[color] || colors.blue;

  return (
    <div className={`rounded-2xl border border-gray-200 p-6 ${cls}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default async function MemberDashboard() {
  const user = await getUser();

  return (
    <>
      <Sidebar role={user.role === 'Faculty' ? 'Faculty' : 'Student'} />
      <Header user={{ name: user.fullName || 'Member', role: user.role, memberId: user.memberId }} />

      <main className="ml-64 pt-24 px-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {user.role === 'Faculty' ? 'Faculty' : 'Student'} Dashboard
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatsCard title="Books Borrowed" value="2" color="blue" />
            <StatsCard title="Due in Next 7 Days" value="1" color="purple" />
            <StatsCard title="Total Fines" value="₹0" color="green" />
          </div>

          {/* Currently Borrowed */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-10">
            <h2 className="text-xl font-bold mb-6">Currently Borrowed</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-4 border-b">
                <div>
                  <p className="font-medium">Database System Concepts</p>
                  <p className="text-sm text-gray-600">Due: 30 Nov 2025</p>
                </div>
                <span className="text-green-600 font-medium">On Time</span>
              </div>
              <div className="flex justify-between items-center py-4">
                <div>
                  <p className="font-medium">Operating System</p>
                  <p className="text-sm text-gray-600">Due: 28 Nov 2025</p>
                </div>
                <span className="text-red-600 font-medium">3 Days Left</span>
              </div>
            </div>
          </div>

          {/* LIVE SEARCH — FULL WIDTH */}
          <DashboardBookSearch />

          {/* Optional: Keep old button or remove */}
          {/* <a href="/search" className="mt-8 inline-block px-8 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition">
            Advanced Search →
          </a> */}
        </div>
      </main>
    </>
  );
}