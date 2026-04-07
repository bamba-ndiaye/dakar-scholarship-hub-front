import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, GraduationCap, Banknote } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { api } from '@/lib/api';

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: application, isLoading } = useQuery({
    queryKey: ['applications', 'detail', id],
    queryFn: () => api.getApplication(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return <p className="text-center py-16 text-muted-foreground">Chargement...</p>;
  }

  if (!application) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Demande introuvable</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="dashboard-hero flex items-center gap-3 px-6 py-6 md:px-8 md:py-7">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-heading">{application.reference}</h1>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Créée le {formatDate(application.createdAt)}</p>
        </div>
      </div>

      <Card className="dashboard-surface">
        <CardHeader>
          <CardTitle className="text-base font-heading">Informations académiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Référence</p>
                <p className="text-sm font-medium font-mono">{application.reference}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <GraduationCap className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Université</p>
                <p className="text-sm font-medium">{application.university}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <GraduationCap className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Programme</p>
                <p className="text-sm font-medium">{application.program} — {application.level}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Année académique</p>
                <p className="text-sm font-medium">{application.year}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Banknote className="h-4 w-4 mt-0.5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Montant demandé</p>
                <p className="text-sm font-medium">{formatCurrency(application.amount)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dashboard-surface">
        <CardHeader>
          <CardTitle className="text-base font-heading">Motivation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {application.motivation || 'Aucune motivation renseignée.'}
          </p>
        </CardContent>
      </Card>

      {application.reviewNote && (
        <Card className="dashboard-surface border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base font-heading text-destructive">Note du responsable</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{application.reviewNote}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationDetailPage;
