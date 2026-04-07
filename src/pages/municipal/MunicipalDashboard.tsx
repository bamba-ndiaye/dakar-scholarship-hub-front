import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, Clock, CheckCircle, XCircle, Eye, List, LayoutGrid, DollarSign, Calendar, Building, Search } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { ScholarshipApplication } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type ViewMode = 'list' | 'grid';

const MunicipalDashboard = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedApp, setSelectedApp] = useState<ScholarshipApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', 'municipal-dashboard'],
    queryFn: () => api.getApplications({ limit: '100' }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'review' }) =>
      api.updateApplicationStatus(id, status),
    onSuccess: async (_, variables) => {
      toast.success(variables.status === 'approved' ? 'Demande approuvee avec succes.' : 'Demande rejetee avec succes.');
      setDetailOpen(false);
      setSelectedApp(null);
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Impossible de mettre a jour cette demande.');
    },
  });

  const pendingApps = useMemo(
    () => applications.filter((application) => application.status === 'submitted' || application.status === 'review'),
    [applications],
  );

  const assignedApps = useMemo(
    () => applications.filter((application) => application.assignedTo && (!user?.id || application.assignedTo === user.id)),
    [applications, user?.id],
  );

  const filteredPendingApps = useMemo(() => {
    const searchValue = search.toLowerCase();
    return pendingApps.filter(
      (application) =>
        application.studentName.toLowerCase().includes(searchValue) ||
        application.university.toLowerCase().includes(searchValue) ||
        application.reference.toLowerCase().includes(searchValue),
    );
  }, [pendingApps, search]);

  const approvedCount = applications.filter((application) => application.status === 'approved').length;
  const rejectedCount = applications.filter((application) => application.status === 'rejected').length;

  const handleViewDetail = (application: ScholarshipApplication) => {
    setSelectedApp(application);
    setDetailOpen(true);
  };

  const renderCards = (items: ScholarshipApplication[], emptyLabel: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((application) => (
        <div key={application.id} className="dashboard-surface p-5 transition-all cursor-pointer hover:-translate-y-1" onClick={() => handleViewDetail(application)}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sm font-bold text-primary">
                {application.studentName.split(' ').map((name) => name[0]).join('')}
              </div>
              <div>
                <p className="font-medium">{application.studentName}</p>
                <p className="text-xs text-muted-foreground">{application.reference}</p>
              </div>
            </div>
            <StatusBadge status={application.status} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{application.university}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="font-semibold">{formatCurrency(application.amount)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDate(application.createdAt)}
            </div>
          </div>
        </div>
      ))}
      {items.length === 0 && <div className="col-span-full text-center py-8 text-muted-foreground">{emptyLabel}</div>}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-hero px-6 py-6 md:px-8 md:py-7">
        <h1 className="text-2xl font-bold font-heading">Tableau de bord Responsable Municipal</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestion des demandes de bourses</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total demandes" value={applications.length} icon={ClipboardList} variant="primary" />
        <StatCard title="En attente" value={pendingApps.length} icon={Clock} variant="warning" />
        <StatCard title="Approuvees" value={approvedCount} icon={CheckCircle} variant="success" />
        <StatCard title="Refusees" value={rejectedCount} icon={XCircle} variant="destructive" />
      </div>

      <Card className="dashboard-surface">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-heading">Demandes en attente ({filteredPendingApps.length})</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Référence, étudiant..." className="pl-9 w-48" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <div className="dashboard-soft-surface flex p-1">
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className="rounded-r-none" onClick={() => setViewMode('list')}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className="rounded-l-none" onClick={() => setViewMode('grid')}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
          ) : viewMode === 'list' ? (
            <div className="dashboard-table-shell overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Etudiant</TableHead>
                    <TableHead>Universite</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPendingApps.map((application) => (
                    <TableRow key={application.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{application.reference}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {application.studentName.split(' ').map((name) => name[0]).join('')}
                          </div>
                          <span className="font-medium">{application.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{application.university}</TableCell>
                      <TableCell>{application.program}</TableCell>
                      <TableCell>{formatCurrency(application.amount)}</TableCell>
                      <TableCell><StatusBadge status={application.status} /></TableCell>
                      <TableCell className="text-sm">{formatDate(application.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetail(application)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredPendingApps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Aucune demande en attente</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : renderCards(filteredPendingApps, 'Aucune demande en attente')}
        </CardContent>
      </Card>

      <Card className="dashboard-surface">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Demandes assignees ({assignedApps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
          ) : viewMode === 'list' ? (
            <div className="dashboard-table-shell overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Etudiant</TableHead>
                    <TableHead>Universite</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedApps.map((application) => (
                    <TableRow key={application.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{application.reference}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {application.studentName.split(' ').map((name) => name[0]).join('')}
                          </div>
                          <span className="font-medium">{application.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{application.university}</TableCell>
                      <TableCell>{application.program}</TableCell>
                      <TableCell>{formatCurrency(application.amount)}</TableCell>
                      <TableCell><StatusBadge status={application.status} /></TableCell>
                      <TableCell className="text-sm">{formatDate(application.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetail(application)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {assignedApps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Aucune demande assignee</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : renderCards(assignedApps, 'Aucune demande assignee')}
        </CardContent>
      </Card>

      <ApplicationDetailDialog
        application={selectedApp}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onApprove={(application) => updateStatus.mutate({ id: application.id, status: 'approved' })}
        onReject={(application) => updateStatus.mutate({ id: application.id, status: 'rejected' })}
        isActionPending={updateStatus.isPending}
      />
    </div>
  );
};

export default MunicipalDashboard;
