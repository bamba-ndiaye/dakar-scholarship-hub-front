import { User, ScholarshipApplication, Notification, Conversation, Message, DashboardStats } from '@/types';

export const mockUsers: User[] = [
  { id: '1', firstName: 'Aminata', lastName: 'Diallo', email: 'aminata@edu.sn', role: 'student', phone: '+221 77 123 4567', address: 'Plateau, Dakar', createdAt: '2024-01-15' },
  { id: '2', firstName: 'Moussa', lastName: 'Ndiaye', email: 'moussa@edu.sn', role: 'student', phone: '+221 78 234 5678', address: 'Médina, Dakar', createdAt: '2024-02-10' },
  { id: '3', firstName: 'Ibrahima', lastName: 'Sow', email: 'ibrahima@mairie-dakar.sn', role: 'municipal', phone: '+221 76 345 6789', address: 'Mairie de Dakar', createdAt: '2023-06-01' },
  { id: '4', firstName: 'Fatou', lastName: 'Ba', email: 'fatou@mairie-dakar.sn', role: 'admin', phone: '+221 70 456 7890', address: 'Mairie de Dakar', createdAt: '2023-01-01' },
  { id: '5', firstName: 'Ousmane', lastName: 'Fall', email: 'ousmane@edu.sn', role: 'student', phone: '+221 77 567 8901', address: 'Parcelles Assainies, Dakar', createdAt: '2024-03-05' },
];

export const mockApplications: ScholarshipApplication[] = [
  { id: 'APP-001', studentId: '1', studentName: 'Aminata Diallo', status: 'approved', university: 'Université Cheikh Anta Diop', program: 'Informatique', level: 'Master 2', year: '2024-2025', amount: 500000, motivation: 'Je souhaite poursuivre mes études...', documents: [], assignedTo: '3', createdAt: '2024-09-01', updatedAt: '2024-09-15', submittedAt: '2024-09-02' },
  { id: 'APP-002', studentId: '2', studentName: 'Moussa Ndiaye', status: 'review', university: 'Université Gaston Berger', program: 'Économie', level: 'Licence 3', year: '2024-2025', amount: 350000, motivation: 'Mon objectif est de...', documents: [], assignedTo: '3', createdAt: '2024-09-05', updatedAt: '2024-09-10', submittedAt: '2024-09-06' },
  { id: 'APP-003', studentId: '5', studentName: 'Ousmane Fall', status: 'submitted', university: 'ISM Dakar', program: 'Gestion', level: 'Licence 2', year: '2024-2025', amount: 400000, motivation: 'Passionné par la gestion...', documents: [], createdAt: '2024-09-08', updatedAt: '2024-09-08', submittedAt: '2024-09-08' },
  { id: 'APP-004', studentId: '1', studentName: 'Aminata Diallo', status: 'draft', university: 'UCAD', program: 'Mathématiques', level: 'Doctorat', year: '2025-2026', amount: 750000, motivation: '', documents: [], createdAt: '2024-10-01', updatedAt: '2024-10-01' },
  { id: 'APP-005', studentId: '2', studentName: 'Moussa Ndiaye', status: 'rejected', university: 'UGB', program: 'Droit', level: 'Master 1', year: '2023-2024', amount: 300000, motivation: 'Je souhaite me spécialiser...', documents: [], assignedTo: '3', reviewNote: 'Dossier incomplet', createdAt: '2024-03-01', updatedAt: '2024-04-01', submittedAt: '2024-03-02' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', userId: '1', title: 'Demande approuvée', message: 'Votre demande APP-001 a été approuvée.', read: false, type: 'status_update', createdAt: '2024-09-15T10:30:00' },
  { id: 'n2', userId: '1', title: 'Nouveau message', message: 'Vous avez reçu un message de M. Sow.', read: true, type: 'new_message', createdAt: '2024-09-14T14:20:00' },
  { id: 'n3', userId: '3', title: 'Nouvelle demande', message: 'Une nouvelle demande vous a été assignée.', read: false, type: 'assignment', createdAt: '2024-09-10T09:00:00' },
];

export const mockConversations: Conversation[] = [
  { id: 'c1', participants: [{ id: '1', name: 'Aminata Diallo', role: 'student' }, { id: '3', name: 'Ibrahima Sow', role: 'municipal' }], lastMessage: 'Merci pour votre retour.', lastMessageAt: '2024-09-15T10:30:00', unreadCount: 1 },
  { id: 'c2', participants: [{ id: '2', name: 'Moussa Ndiaye', role: 'student' }, { id: '3', name: 'Ibrahima Sow', role: 'municipal' }], lastMessage: 'Pourriez-vous fournir le relevé de notes ?', lastMessageAt: '2024-09-12T16:45:00', unreadCount: 0 },
];

export const mockMessages: Message[] = [
  { id: 'm1', conversationId: 'c1', senderId: '3', senderName: 'Ibrahima Sow', content: 'Bonjour, votre demande a été approuvée. Félicitations !', read: true, createdAt: '2024-09-15T10:00:00' },
  { id: 'm2', conversationId: 'c1', senderId: '1', senderName: 'Aminata Diallo', content: 'Merci pour votre retour.', read: false, createdAt: '2024-09-15T10:30:00' },
  { id: 'm3', conversationId: 'c2', senderId: '3', senderName: 'Ibrahima Sow', content: 'Pourriez-vous fournir le relevé de notes ?', read: true, createdAt: '2024-09-12T16:45:00' },
];

export const mockStudentStats: DashboardStats = {
  totalApplications: 3,
  pendingApplications: 1,
  approvedApplications: 1,
  rejectedApplications: 1,
};

export const mockMunicipalStats: DashboardStats = {
  totalApplications: 5,
  pendingApplications: 2,
  approvedApplications: 1,
  rejectedApplications: 1,
};

export const mockAdminStats: DashboardStats = {
  totalApplications: 5,
  pendingApplications: 2,
  approvedApplications: 1,
  rejectedApplications: 1,
  totalUsers: 5,
  approvalRate: 20,
};
