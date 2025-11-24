// components/books/ReturnBookForm.tsx
'use client';

import { useState } from 'react';
import { Search, RotateCcw, Loader2, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface TransactionInfo {
  transactionId: string;
  bookTitle: string;
  bookAuthor: string;
  memberName: string;
  memberId: string;
  userType: string;
  issueDate: string;
  dueDate: string;
  isLate: boolean;
  daysLate: number;
  potentialFine: number;
}

interface ReturnSuccess {
  transactionId: string;
  bookTitle: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate: string;
  isLate: boolean;
  daysLate?: number;
  fineAmount?: number;
}

export default function ReturnBookForm() {
  const [bookCopyId, setBookCopyId] = useState('');
  const [transactionInfo, setTransactionInfo] = useState<TransactionInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<ReturnSuccess | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkBookStatus = async () => {
    if (!bookCopyId.trim()) return;

    setChecking(true);
    setTransactionInfo(null);
    setError(null);

    try {
      const res = await fetch(`/api/books/return?bookCopyId=${bookCopyId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Book not found or not currently issued');
        return;
      }

      setTransactionInfo(data.data);
    } catch (error) {
      console.error('Check book error:', error);
      setError('Failed to check book status');
    } finally {
      setChecking(false);
    }
  };

  const handleReturn = async () => {
    if (!transactionInfo) return;

    setProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/books/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookCopyId })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to process return');
        return;
      }

      setSuccess(data.data);

      // Reset form after delay
      setTimeout(() => {
        setBookCopyId('');
        setTransactionInfo(null);
        setSuccess(null);
      }, 5000);

    } catch (error) {
      console.error('Return book error:', error);
      setError('An unexpected error occurred');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Success Message */}
      {success && (
        <div className={`mb-6 p-6 border-2 rounded-xl ${
          success.isLate 
            ? 'bg-orange-50 border-orange-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start gap-4">
            <CheckCircle className={`w-6 h-6 flex-shrink-0 mt-1 ${
              success.isLate ? 'text-orange-600' : 'text-green-600'
            }`} />
            <div className="flex-1">
              <h3 className={`font-bold mb-3 ${
                success.isLate ? 'text-orange-900' : 'text-green-900'
              }`}>
                Book Returned Successfully!
              </h3>
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
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-semibold">{success.issueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-semibold">{success.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return Date:</span>
                  <span className="font-semibold">{success.returnDate}</span>
                </div>
                {success.isLate && (
                  <>
                    <div className="pt-2 border-t border-gray-200"></div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days Late:</span>
                      <span className="font-semibold text-red-600">{success.daysLate} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fine Amount:</span>
                      <span className="font-bold text-red-600 text-lg">₹{success.fineAmount}</span>
                    </div>
                  </>
                )}
              </div>
              {success.isLate && (
                <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                  <p className="text-sm text-orange-900 font-medium">
                    ⚠️ Fine has been added to member&#34;s account
                  </p>
                </div>
              )}
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
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
            <RotateCcw className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Return Book</h2>
            <p className="text-gray-600 text-sm">Scan or enter book copy ID to process return</p>
          </div>
        </div>

        {/* Book Copy ID Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Book Copy ID
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={bookCopyId}
              onChange={(e) => {
                setBookCopyId(e.target.value);
                setTransactionInfo(null);
              }}
              placeholder="e.g., BK-2025-0001-01"
              className="flex-1 px-4 py-3 text-gray-800 placeholder-gray-500 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600"
              onKeyPress={(e) => e.key === 'Enter' && checkBookStatus()}
            />
            <button
              onClick={checkBookStatus}
              disabled={!bookCopyId.trim() || checking}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {checking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Check Status
                </>
              )}
            </button>
          </div>
        </div>

        {/* Transaction Info Display */}
        {transactionInfo && (
          <div className={`mb-6 p-6 rounded-xl border-2 ${
            transactionInfo.isLate 
              ? 'bg-red-50 border-red-200' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            {transactionInfo.isLate && (
              <div className="flex items-center gap-2 mb-4 p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-900">OVERDUE RETURN</span>
              </div>
            )}

            <div className="mb-4">
              <h3 className="font-bold text-lg mb-1">{transactionInfo.bookTitle}</h3>
              <p className="text-sm text-gray-600">by {transactionInfo.bookAuthor}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-600">Transaction ID:</span>
                <p className="font-mono font-semibold">{transactionInfo.transactionId}</p>
              </div>
              <div>
                <span className="text-gray-600">Member:</span>
                <p className="font-semibold">{transactionInfo.memberName}</p>
                <p className="text-xs text-gray-500">{transactionInfo.memberId} • {transactionInfo.userType}</p>
              </div>
              <div>
                <span className="text-gray-600">Issue Date:</span>
                <p className="font-semibold">{transactionInfo.issueDate}</p>
              </div>
              <div>
                <span className="text-gray-600">Due Date:</span>
                <p className={`font-semibold ${transactionInfo.isLate ? 'text-red-600' : ''}`}>
                  {transactionInfo.dueDate}
                </p>
              </div>
            </div>

            {transactionInfo.isLate && (
              <div className="pt-4 border-t border-red-300">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Days Overdue:</span>
                    <p className="font-bold text-red-600 text-xl">{transactionInfo.daysLate}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Fine Amount:</span>
                    <p className="font-bold text-red-600 text-xl">₹{transactionInfo.potentialFine}</p>
                  </div>
                </div>
                <p className="text-xs text-red-700 mt-3">
                  Fine calculated at ₹5 per day
                </p>
              </div>
            )}
          </div>
        )}

        {/* Process Return Button */}
        <button
          onClick={handleReturn}
          disabled={!transactionInfo || processing}
          className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Return...
            </>
          ) : (
            <>
              <RotateCcw className="w-5 h-5" />
              Process Return
            </>
          )}
        </button>

        {transactionInfo?.isLate && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-sm text-orange-900">
              <strong>Note:</strong> This return is late. The fine will be automatically added to the member&#34;s account.
            </p>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-bold text-blue-900 mb-2">💰 Fine Calculation</h4>
          <p className="text-sm text-blue-800">
            ₹5 per day after due date. Fines are automatically added to member&#34;s account.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h4 className="font-bold text-green-900 mb-2">✅ Auto-Available</h4>
          <p className="text-sm text-green-800">
            Books become available immediately after return for other members to borrow.
          </p>
        </div>
      </div>
    </div>
  );
}