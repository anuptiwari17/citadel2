// components/books/AddBookForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

export default function AddBookForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyIds, setCopyIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    categoryId: '',
    numberOfCopies: 1,
    shelfLocation: ''
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/books/add');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'publicationYear' || name === 'numberOfCopies' || name === 'categoryId'
        ? value === '' ? '' : parseInt(value)
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setCopyIds([]);

    try {
      const res = await fetch('/api/books/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add book');
        return;
      }

      setSuccess(data.message);
      setCopyIds(data.data.copyIds);

      // Reset form
      setFormData({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        publicationYear: new Date().getFullYear(),
        categoryId: '',
        numberOfCopies: 1,
        shelfLocation: ''
      });

      // Scroll to success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Add book error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-green-900 mb-2">{success}</h3>
              {copyIds.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-green-800 font-medium mb-2">Generated Book Copy IDs:</p>
                  <div className="bg-white rounded-lg p-3 space-y-1">
                    {copyIds.map((id, index) => (
                      <div key={index} className="text-sm font-mono text-gray-700">
                        📚 {id}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-6 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-900">Error</h3>
              <p className="text-red-800 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Book</h2>
            <p className="text-gray-600 text-sm">Fill in the book details below</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Database System Concepts"
              maxLength={200}
              required
              className="w-full px-4 py-3 border text-gray-600 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Author Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g., Abraham Silberschatz"
              required
              className="w-full px-4 py-3 border text-gray-700 border-gray-300 placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* ISBN */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              ISBN <span className="text-gray-500 text-xs font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="e.g., 9780134190440 or 0134190440"
              className="w-full px-4 py-3 text-gray-700 placeholder-gray-500 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <p className="text-xs text-gray-500 mt-1">Must be 10 or 13 digits</p>
          </div>

          {/* Publisher & Year Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Publisher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="publisher"
                value={formData.publisher}
                onChange={handleChange}
                placeholder="e.g., McGraw-Hill"
                required
                className="w-full px-4 py-3 placeholder-gray-500 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Publication Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="publicationYear"
                value={formData.publicationYear}
                onChange={handleChange}
                min={1900}
                max={new Date().getFullYear()}
                required
                className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Category & Copies Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category <span className="text-gray-500 text-xs font-normal">(Optional)</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Number of Copies <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="numberOfCopies"
                value={formData.numberOfCopies}
                onChange={handleChange}
                min={1}
                max={100}
                required
                className="w-full px-4 py-3 text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Shelf Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Shelf Location <span className="text-gray-500 text-xs font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="shelfLocation"
              value={formData.shelfLocation}
              onChange={handleChange}
              placeholder="e.g., A-101, Section B, Shelf 3"
              className="w-full px-4 py-3 text-gray-800 placeholder-gray-500 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding Book...
              </>
            ) : (
              <>
                <BookOpen className="w-5 h-5" />
                Add Book to Library
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}