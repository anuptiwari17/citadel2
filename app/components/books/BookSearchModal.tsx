// components/books/BookSearchModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, X, BookOpen, Users, Calendar, MapPin, Loader2 } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string;
  publication_year: number;
  total_copies: number;
  available_copies: number;
  shelf_location: string | null;
  categories: { id: number; name: string } | null;
  isAvailable: boolean;
  status: string;
}

interface Category {
  id: number;
  name: string;
}

export default function BookSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchType, setSearchType] = useState<'title' | 'author' | 'isbn' | 'category'>('title');
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/books/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-categories' })
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() && searchType !== 'category') return;
    if (searchType === 'category' && !categoryId) return;

    setLoading(true);
    setSearched(true);

    try {
      let url = `/api/books/search?type=${searchType}`;
      
      if (searchType === 'category') {
        url += `&categoryId=${categoryId}`;
      } else {
        url += `&query=${encodeURIComponent(query)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setResults(data.data);
      } else {
        alert(data.error || 'Search failed');
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search books');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setQuery('');
    setCategoryId('');
    setResults([]);
    setSearched(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mb-20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Search Books</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="p-6 border-b border-gray-200">
          {/* Search Type Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {(['title', 'author', 'isbn', 'category'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSearchType(type);
                  resetSearch();
                }}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  searchType === type
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex gap-3">
            {searchType === 'category' ? (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search by ${searchType}...`}
                className="flex-1 px-4 py-3 border border-gray-300 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="p-6 max-h-[500px] overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No books found</p>
              <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Found <span className="font-semibold">{results.length}</span> book{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((book) => (
                <div
                  key={book.id}
                  className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{book.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{book.author}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        book.isAvailable
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {book.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>
                        {book.available_copies} of {book.total_copies} available
                      </span>
                    </div>
                    {book.shelf_location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{book.shelf_location}</span>
                      </div>
                    )}
                    {book.publication_year && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{book.publication_year}</span>
                      </div>
                    )}
                    {book.categories && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Category:</span>
                        <span>{book.categories.name}</span>
                      </div>
                    )}
                  </div>

                  {book.isbn && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500">ISBN: {book.isbn}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !searched && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Start searching for books</p>
              <p className="text-gray-500 text-sm mt-2">Select a search type and enter your query</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}