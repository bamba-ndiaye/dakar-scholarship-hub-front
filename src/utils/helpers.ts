import { ApplicationStatus } from '@/types';

export const statusLabels: Record<ApplicationStatus, string> = {
  draft: 'Brouillon',
  submitted: 'Soumise',
  review: 'En analyse',
  approved: 'Approuvée',
  rejected: 'Refusée',
};

export const statusColors: Record<ApplicationStatus, string> = {
  draft: 'status-badge-draft',
  submitted: 'status-badge-submitted',
  review: 'status-badge-review',
  approved: 'status-badge-approved',
  rejected: 'status-badge-rejected',
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));

export const formatDateTime = (date: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
