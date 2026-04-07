// Carte statistique réutilisable pour les tableaux de bord
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

const variantStyles = {
  default: 'bg-card border-border shadow-sm',
  primary: 'bg-card border-primary/15 shadow-sm',
  success: 'bg-card border-success/20 shadow-sm',
  warning: 'bg-card border-warning/20 shadow-sm',
  destructive: 'bg-card border-destructive/20 shadow-sm',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  destructive: 'bg-destructive text-destructive-foreground',
};

const valueStyles = {
  default: 'text-foreground',
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
};

const StatCard = ({ title, value, icon: Icon, description, trend, variant = 'default' }: StatCardProps) => {
  const analyticsAccentStyles = {
    default: 'from-slate-300 via-slate-200 to-slate-100',
    primary: 'from-[#2563EB] via-[#3B82F6] to-[#BFDBFE]',
    success: 'from-emerald-500 via-emerald-400 to-emerald-100',
    warning: 'from-amber-500 via-amber-400 to-amber-100',
    destructive: 'from-rose-500 via-rose-400 to-rose-100',
  };

  return (
    <Card className={cn(
      variantStyles[variant],
      'transition-all hover:-translate-y-0.5 hover:shadow-md',
      'relative overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.12)]',
    )}>
      <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', analyticsAccentStyles[variant])} />
      <CardContent className={cn('p-5', 'p-6')}>
        <div className="flex flex-col items-center justify-center gap-4 text-center min-h-[148px]">
          <div className={cn(
            `rounded-2xl p-3 shadow-sm ${iconStyles[variant]}`,
            'rounded-[20px] ring-1 ring-black/5 shadow-none',
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold font-heading tracking-tight ${valueStyles[variant]}`}>{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && <p className="text-xs font-medium text-success">{trend}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
