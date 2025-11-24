// components/books/IssueBookForm.tsx
'use client';

import { useState } from 'react';
import { Search, UserCheck, BookOpen, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface MemberInfo {
  member_id: string;
  full_name: string;
  user_type: string;
  total_fine: number;
  currentBorrowings: number;
  borrowLimit: number;
  canBorrow: boolean;
  reason?: string;
}

interface BookInfo {
  book_copy_id: string;
  status: string;
  books: {
    title: string;
    author: string;
    publisher: string;
    shelf_location: string;
  };
  canIssue: boolean;
}

export default function IssueBookForm() {
  const [memberId, setMemberId] = useState('');
  const [bookCopyId, setBookCopyId] = useState('');
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [verifyingMember, setVerifyingMember] = useState(false);
  const [verifyingBook, setVerifyingBook] = useState(false);
  const [issuing, setIssuing] = useState(false);
  interface IssueSuccess {
    transactionId: string;
    bookTitle: string;
    bookAuthor: string;
    memberName: string;
    memberId: string;
    issueDate: string;
    dueDate: string;
    borrowPeriod: string;
  }

  const [success, setSuccess] = useState<IssueSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyMember = async () => {
    if (!memberId.trim()) return;

    setVerifyingMember(true);
    setMemberInfo(null);
    setError(null);

    try {
      const res = await fetch(`/api/books/issue?type=member&query=${memberId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Member not found');
        return;
      }

      setMemberInfo(data.data);
    } catch (error) {
      console.error('Verify member error:', error);
      setError('Failed to verify member');
    } finally {
      setVerifyingMember(false);
    }
  };

  const verifyBook = async () => {
    if (!bookCopyId.trim()) return;

    setVerifyingBook(true);
    setBookInfo(null);
    setError(null);

    try {
      const res = await fetch(`/api/books/issue?type=book&query=${bookCopyId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Book copy not found');
        return;
      }

      setBookInfo(data.data);
    } catch (error) {
      console.error('Verify book error:', error);
      setError('Failed to verify book');
    } finally {
      setVerifyingBook(false);
    }
  };

  const handleIssue = async () => {
    if (!memberInfo || !bookInfo) return;

    setIssuing(true);
    setError(null);

    try {
      const res = await fetch('/api/books/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: memberInfo.member_id,
          bookCopyId: bookInfo.book_copy_id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to issue book');
        return;
      }

      setSuccess(data.data);

      // Reset form after delay
      setTimeout(() => {
        setMemberId('');
        setBookCopyId('');
        setMemberInfo(null);
        setBookInfo(null);
        setSuccess(null);
      }, 5000);

    } catch (error) {
      console.error('Issue book error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-6 bg-green-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-green-900 mb-3">Book Issued Successfully! 🎉</h3>
              <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono font-semibold">{success.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Book:</span>
                  <span className="font-semibold">{success.bookTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member:</span>
                  <span className="font-semibold">{success.memberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-semibold text-red-600">{success.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-semibold">{success.borrowPeriod}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Issue Book</h2>
            <p className="text-gray-600 text-sm">Verify member and book before issuing</p>
          </div>
        </div>

        {/* Step 1: Member ID */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Step 1: Enter Member ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={memberId}
              onChange={(e) => {
                setMemberId(e.target.value);
                setMemberInfo(null);
              }}
              placeholder="e.g., MEM-2025-0001"
              className="flex-1 px-4 py-3 text-gray-800 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500"
              onKeyPress={(e) => e.key === 'Enter' && verifyMember()}
            />
            <button
              onClick={verifyMember}
              disabled={!memberId.trim() || verifyingMember}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {verifyingMember ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Verify Member
                </>
              )}
            </button>
          </div>

          {/* Member Info Display */}
          {memberInfo && (
            <div className={`mt-4 p-4 rounded-xl border-2 ${
              memberInfo.canBorrow 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{memberInfo.full_name}</h3>
                  <p className="text-sm text-gray-600">{memberInfo.member_id} • {memberInfo.user_type}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  memberInfo.canBorrow 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {memberInfo.canBorrow ? 'Can Borrow' : 'Cannot Borrow'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Borrowed:</span>
                  <span className="ml-2 font-semibold">{memberInfo.currentBorrowings}/{memberInfo.borrowLimit}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Fine:</span>
                  <span className="ml-2 font-semibold">₹{memberInfo.total_fine}</span>
                </div>
                {memberInfo.reason && (
                  <div className="col-span-3 text-red-600 font-medium">
                    ⚠️ {memberInfo.reason}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Book Copy ID */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Step 2: Enter Book Copy ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={bookCopyId}
              onChange={(e) => {
                setBookCopyId(e.target.value);
                setBookInfo(null);
              }}
              placeholder="e.g., BK-2025-0001-01"
              className="flex-1 px-4 py-3 text-gray-800 placeholder-gray-500 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              onKeyPress={(e) => e.key === 'Enter' && verifyBook()}
            />
            <button
              onClick={verifyBook}
              disabled={!bookCopyId.trim() || verifyingBook}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {verifyingBook ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Verify Book
                </>
              )}
            </button>
          </div>

          {/* Book Info Display */}
          {bookInfo && (
            <div className={`mt-4 p-4 rounded-xl border-2 ${
              bookInfo.canIssue 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{bookInfo.books.title}</h3>
                  <p className="text-sm text-gray-600">by {bookInfo.books.author}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  bookInfo.canIssue 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {bookInfo.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Copy ID:</span>
                  <span className="ml-2 font-mono font-semibold">{bookInfo.book_copy_id}</span>
                </div>
                {bookInfo.books.shelf_location && (
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <span className="ml-2 font-semibold">{bookInfo.books.shelf_location}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Issue Button */}
        <button
          onClick={handleIssue}
          disabled={!memberInfo?.canBorrow || !bookInfo?.canIssue || issuing}
          className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {issuing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Issuing Book...
            </>
          ) : (
            <>
              <ArrowRight className="w-5 h-5" />
              Issue Book to Member
            </>
          )}
        </button>
      </div>
    </div>
  );
}