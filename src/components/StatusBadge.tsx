// Badge de statut coloré pour les demandes
import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@/types';
import { statusLabels, statusColors } from '@/utils/helpers';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const StatusBadge = ({ status, className = '' }: StatusBadgeProps) => {
  return (
    <Badge variant="outline" className={`${statusColors[status]} border-0 font-medium text-xs px-2.5 py-0.5 ${className}`}>
      {statusLabels[status]}
    </Badge>
  );
};

export default StatusBadge;
