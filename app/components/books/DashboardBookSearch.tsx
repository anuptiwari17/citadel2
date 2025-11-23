// components/books/DashboardBookSearch.tsx

"use client"

import { useState } from 'react'
import BookSearchResults from './BookSearchResults'
import { BookSearchResult } from '../../../types/database'

export default function DashboardBookSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BookSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setShowResults(true)

    const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}&available_only=true`)
    const data = await res.json()

    setResults(data.success ? data.data : [])
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Quick Book Search</h2>
      
      <form onSubmit={handleSearch} className="flex gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, ISBN..."
          className="flex-1 px-5 py-3 rounded-xl border border-gray-300 focus:border-gray-900 outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-70"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="text-center">
        <a href="/search" className="text-sm text-gray-600 hover:text-gray-900 underline">
          Advanced Search →
        </a>
      </div>

      {showResults && (
        <div className="mt-6 border-t pt-6">
          {loading ? (
            <p className="text-center text-gray-500">Searching library...</p>
          ) : results.length === 0 ? (
            <p className="text-center text-gray-500">No books found for &#34;{query}&#34;</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Found {results.length} available book{results.length !== 1 ? 's' : ''}
              </p>
              <div className="grid gap-4 max-h-96 overflow-y-auto">
                {results.slice(0, 5).map(({ book, available_copies, shelf_location }) => (
                  <div key={book.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{book.title}</p>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                      {shelf_location && <p className="text-xs text-gray-500 mt-1">Shelf: {shelf_location}</p>}
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {available_copies} Available
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {results.length > 5 && (
                <a href={`/search?q=${query}`} className="block text-center mt-4 text-gray-700 hover:text-gray-900 font-medium">
                  View all {results.length} results →
                </a>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}