// === Types principaux de la plateforme ===

export type UserRole = 'student' | 'municipal' | 'admin';

export type ApplicationStatus = 'draft' | 'submitted' | 'review' | 'approved' | 'rejected';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface ScholarshipApplication {
  id: string;
  reference: string;
  studentId: string;
  studentName: string;
  status: ApplicationStatus;
  university: string;
  program: string;
  level: string;
  year: string;
  amount: number;
  motivation: string;
  documents: Document[];
  assignedTo?: string;
  reviewNote?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'diploma' | 'student_card' | 'transcript' | 'enrollment_certificate' | 'other';
  fileType: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'status_update' | 'new_message' | 'assignment' | 'system';
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: { id: string; name: string; role: UserRole }[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalUsers?: number;
  approvalRate?: number;
}
