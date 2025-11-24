// components/books/DashboardBookSearch.tsx
'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import BookSearchModal from './BookSearchModal';

export default function DashboardBookSearch() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Search Books</h2>
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>

        <p className="text-gray-600 mb-6">
          Quick access to library catalog. Search by title, author, ISBN, or category.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition group"
        >
          <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Open Search</span>
        </button>

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <div className="px-4 py-3 bg-blue-50 rounded-lg text-blue-700 font-medium text-center">
            📚 By Title
          </div>
          <div className="px-4 py-3 bg-purple-50 rounded-lg text-purple-700 font-medium text-center">
            ✍️ By Author
          </div>
          <div className="px-4 py-3 bg-green-50 rounded-lg text-green-700 font-medium text-center">
            🔢 By ISBN
          </div>
          <div className="px-4 py-3 bg-orange-50 rounded-lg text-orange-700 font-medium text-center">
            📂 By Category
          </div>
        </div>
      </div>

      <BookSearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}