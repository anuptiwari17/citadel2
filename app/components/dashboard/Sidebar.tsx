// components/dashboard/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  LogOut, 
  Home, 
  Search, 
  Clock, 
  DollarSign, 
  UserCheck,
  PlusCircle,
  History,
} from 'lucide-react';
import BookSearchModal from '../books/BookSearchModal';

interface NavItem {
  href?: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export default function Sidebar({ role }: { role: 'Admin' | 'Librarian' | 'Student' | 'Faculty' }) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const adminNav: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { href: '/admin/users', label: 'Manage Users', icon: <Users className="w-5 h-5" /> },
    { href: '/admin/books/add', label: 'Add Book', icon: <PlusCircle className="w-5 h-5" /> },
    { href: '/admin/books', label: 'Manage Books', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Search Books', icon: <Search className="w-5 h-5" />, onClick: () => setIsSearchOpen(true) },
    { href: '/admin/overdue', label: 'Overdue & Fines', icon: <DollarSign className="w-5 h-5" /> },
  ];

  const librarianNav: NavItem[] = [
    { href: '/librarian', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { href: '/librarian/issue', label: 'Issue Book', icon: <UserCheck className="w-5 h-5" /> },
    { href: '/librarian/return', label: 'Return Book', icon: <Clock className="w-5 h-5" /> },
    { label: 'Search Books', icon: <Search className="w-5 h-5" />, onClick: () => setIsSearchOpen(true) },
    { href: '/librarian/members', label: 'Search Members', icon: <Users className="w-5 h-5" /> },
    { href: '/librarian/history', label: 'Issue History', icon: <History className="w-5 h-5" /> },
  ];

  const memberNav: NavItem[] = [
    { href: '/member', label: 'My Dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Search Books', icon: <Search className="w-5 h-5" />, onClick: () => setIsSearchOpen(true) },
    { href: '/member/borrowed', label: 'My Books', icon: <BookOpen className="w-5 h-5" /> },
    { href: '/member/fines', label: 'My Fines', icon: <DollarSign className="w-5 h-5" /> },
  ];

  const facultyNav: NavItem[] = [
    { href: '/member', label: 'My Dashboard', icon: <Home className="w-5 h-5" /> },
    { label: 'Search Books', icon: <Search className="w-5 h-5" />, onClick: () => setIsSearchOpen(true) },
    { href: '/member/borrowed', label: 'My Books', icon: <BookOpen className="w-5 h-5" /> },
    { href: '/member/fines', label: 'My Fines', icon: <DollarSign className="w-5 h-5" /> },
  ];

  const navItems = 
    role === 'Admin' ? adminNav :
    role === 'Librarian' ? librarianNav :
    role === 'Faculty' ? facultyNav : memberNav;

  return (
    <>
      <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Citadel</h1>
              <p className="text-xs text-gray-500">NIT Jalandhar</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Role</p>
            <p className="text-sm font-semibold text-gray-900">
              {role === 'Admin' ? 'Administrator' : role}
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((item, index) => {
            if (item.onClick) {
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all font-medium ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <form action="/api/auth/logout" method="POST">
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all w-full font-medium">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </div>

      <BookSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}