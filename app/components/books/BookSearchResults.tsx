// components/books/BookSearchResults.tsx
import { BookSearchResult } from '../../../types/database'

interface BookSearchResultsProps {
  results: BookSearchResult[]
  query: string
}

export default function BookSearchResults({ results, query }: BookSearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No books found for &#34;<span className="font-medium text-gray-700">{query}</span>&#34;</p>
        <p className="text-sm text-gray-400 mt-2">Try searching by title, author, or ISBN</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map(({ book, available_copies, total_copies, shelf_location }) => (
        <div key={book.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{book.title}</h3>
          <p className="text-gray-600 mt-1">by <span className="font-medium">{book.author}</span></p>
          
          {book.isbn && <p className="text-sm text-gray-500 mt-2">ISBN: {book.isbn}</p>}
          {shelf_location && <p className="text-sm text-gray-500">Shelf: {shelf_location}</p>}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Copies:</span>
              <span className={`font-semibold ${available_copies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {available_copies}/{total_copies}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              available_copies > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {available_copies > 0 ? 'Available' : 'Issued'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}