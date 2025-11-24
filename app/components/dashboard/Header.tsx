// components/dashboard/Header.tsx
import { User, Bell } from 'lucide-react';

interface HeaderProps {
  user: {
    name: string;
    role: string;
    memberId: string;
  };
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="mb-4 fixed top-0 right-0 left-64 bg-white border-b border-gray-200 z-40">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.name}! 👋
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {user.memberId} • {user.role}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}