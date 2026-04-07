import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import NewApplicationDialog from '@/components/NewApplicationDialog';
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, XCircle, PlusCircle, ArrowRight } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { useNavigate } from 'react-router-dom';
import { ScholarshipApplication } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<ScholarshipApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ['applications', 'my', 'dashboard'],
    queryFn: () => api.getMyApplications(),
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'student-dashboard'],
    queryFn: () => api.getNotifications(4),
  });

  const updateDraft = useMutation({
    mutationFn: ({ id, input }: {
      id: string;
      input: {
        university: string;
        program: string;
        level: string;
        year: string;
        amount: number;
        motivation: string;
      };
    }) => api.updateApplication(id, input),
    onSuccess: async () => {
      toast.success('Brouillon mis a jour avec succes.');
      setDetailOpen(false);
      setSelectedApp(null);
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Impossible de mettre a jour ce brouillon.');
    },
  });

  const submitDraft = useMutation({
    mutationFn: async ({ id, input }: {
      id: string;
      input: {
        university: string;
        program: string;
        level: string;
        year: string;
        amount: number;
        motivation: string;
      };
    }) => {
      await api.updateApplication(id, input);
      return api.submitApplication(id);
    },
    onSuccess: async () => {
      toast.success('Demande soumise avec succes.');
      setDetailOpen(false);
      setSelectedApp(null);
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Impossible de soumettre ce brouillon.');
    },
  });

  const myApps = applications.slice(0, 3);
  const pendingCount = applications.filter((application) => application.status === 'submitted' || application.status === 'review').length;
  const approvedCount = applications.filter((application) => application.status === 'approved').length;
  const rejectedCount = applications.filter((application) => application.status === 'rejected').length;

  const handleViewDetail = (application: ScholarshipApplication) => {
    setSelectedApp(application);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-hero flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8 md:py-7">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold font-heading">Bonjour, {user?.firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Voici le résumé de vos demandes de bourses</p>
        </div>
        <NewApplicationDialog>
          <Button className="gap-2 cursor-pointer">
            <PlusCircle className="h-4 w-4" /> Nouvelle demande
          </Button>
        </NewApplicationDialog>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total demandes" value={applications.length} icon={FileText} variant="primary" />
        <StatCard title="En attente" value={pendingCount} icon={Clock} variant="warning" />
        <StatCard title="Approuvées" value={approvedCount} icon={CheckCircle} variant="success" />
        <StatCard title="Refusées" value={rejectedCount} icon={XCircle} variant="destructive" />
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">
        <Card className="dashboard-surface lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-heading">Dernières demandes</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate('/applications')}>
              Voir tout <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applicationsLoading ? (
                <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
              ) : (
                myApps.map((application) => (
                  <div
                    key={application.id}
                    className="dashboard-row flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={() => handleViewDetail(application)}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{application.university} — {application.program}</p>
                      <p className="text-xs text-muted-foreground">{application.reference} · {formatDate(application.createdAt)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <StatusBadge status={application.status} />
                      <p className="text-xs font-medium">{formatCurrency(application.amount)}</p>
                    </div>
                  </div>
                ))
              )}
              {!applicationsLoading && myApps.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune demande pour le moment</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-surface">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Notifications récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className={`dashboard-row p-4 text-sm ${!notification.read ? 'bg-primary/5 border-primary/10' : ''}`}>
                  <p className="font-medium text-xs">{notification.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                </div>
              ))}
              {notifications.length === 0 && <p className="text-sm text-muted-foreground">Aucune notification.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <ApplicationDetailDialog
        application={selectedApp}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onSaveDraft={(application, input) => updateDraft.mutate({ id: application.id, input })}
        onSubmitDraft={(application, input) => submitDraft.mutate({ id: application.id, input })}
        isDraftPending={updateDraft.isPending || submitDraft.isPending}
      />
    </div>
  );
};

export default StudentDashboard;
