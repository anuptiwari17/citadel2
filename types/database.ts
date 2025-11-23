// types/database.ts

export type UserRole = 'Admin' | 'Librarian' | 'Faculty' | 'Student'
export type UserShift = 'Morning' | 'Evening' | 'General'
export type UserType = 'Student' | 'Faculty'
export type BookCopyStatus = 'Available' | 'Issued' | 'Removed' | 'Damaged'
export type TransactionStatus = 'Issued' | 'Returned' | 'Overdue'

// ============================
// DATABASE ENTITIES
// ============================

export interface User {
  id: number
  member_id: string                    // MEM-2025-0001
  full_name: string
  email: string                        // only @nitj.ac.in
  phone: string                        // 10 digits
  password_hash: string
  user_type: UserType | null
  roll_or_emp_id: string | null
  shift: UserShift | null              // only for Librarian
  total_fine: number
  is_active: boolean
  is_blocked: boolean
  failed_login_attempts: number
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: UserRole
}

export interface Category {
  id: number
  name: string
  created_at: string
}

export interface Book {
  id: number
  title: string
  author: string
  isbn: string | null
  publisher: string
  publication_year: number
  category_id: number | null
  total_copies: number
  available_copies: number
  shelf_location: string | null
  created_at: string
  updated_at: string
}

export interface BookCopy {
  id: number
  book_id: number
  copy_number: number
  book_copy_id: string                 // BK-2025-0001-01
  status: BookCopyStatus
  removed_at: string | null
}

export interface Transaction {
  id: number
  transaction_id: string
  user_id: number
  book_copy_id: number
  issue_date: string
  due_date: string
  return_date: string | null
  issued_by: number
  returned_to: number | null
  fine_amount: number
  fine_paid: boolean
  status: TransactionStatus
  created_at: string
}

export interface Fine {
  id: number
  transaction_id: number | null
  user_id: number
  amount: number
  reason: string
  paid: boolean
  paid_at: string | null
  created_at: string
}

export interface AuditLog {
  id: number
  user_id: number | null
  action: string
  description: string | null
  ip_address: string | null
  created_at: string
}

// ============================
// API PAYLOADS & RESPONSES
// ============================

export interface ApiResponse<T> {
  success: boolean
  message?: string
  error?: string
  data?: T
}

export interface AuthUser {
  id: number
  member_id: string
  full_name: string
  email: string
  role: UserRole
  user_type: UserType | null
}

export interface IssueBookPayload {
  memberId: string
  bookCopyId: string
}

export interface ReturnBookPayload {
  bookCopyId: string
}

export interface AddBookPayload {
  title: string
  author: string
  isbn?: string
  publisher: string
  publication_year: number
  category_id?: number
  shelf_location?: string
  number_of_copies: number
}

export interface SearchBooksQuery {
  q?: string
  author?: string
  isbn?: string
  category?: string
  available_only?: 'true' | 'false'
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface TransactionReceipt {
  transactionId: string
  memberName: string
  bookTitle: string
  bookCopyId: string
  issueDate: string
  dueDate: string
  fineAmount?: number
}



export interface BookSearchResult {
  book: Book
  total_copies: number
  available_copies: number
  shelf_location: string | null
}

// For future use — Issue/Return receipt preview
export interface BorrowedBook {
  transactionId: string
  bookTitle: string
  bookCopyId: string
  issueDate: string
  dueDate: string
  fineAmount?: number
  status: 'On Time' | 'Due Soon' | 'Overdue'
}