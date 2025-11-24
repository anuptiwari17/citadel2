// types/member.ts

export interface BorrowedBook {
  transactionId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCopyId: string;
  issueDate: string;
  dueDate: string;
  status: string;
  daysUntilDue: number;
  isOverdue: boolean;
}

export interface DashboardStats {
  booksBorrowed: number;
  dueInNext7Days: number;
  totalFines: number;
  borrowLimit: number;
  availableSlots: number;
}

export interface UserInfo {
  memberId: string;
  fullName: string;
  userType: string;
  totalFine: number;
}

export interface DashboardData {
  stats: DashboardStats;
  borrowedBooks: BorrowedBook[];
  userInfo: UserInfo;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}