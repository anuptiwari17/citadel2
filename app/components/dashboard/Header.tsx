// components/dashboard/Header.tsx
import { User } from 'lucide-react';

export default function Header({ user }: { user: { name: string; role: string; memberId: string } }) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-5 ml-64 fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}</h2>
          <p className="text-gray-600">{user.memberId} • {user.role}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 border-2 border-dashed rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
}