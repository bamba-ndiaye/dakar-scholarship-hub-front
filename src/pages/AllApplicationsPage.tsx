import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import StatusBadge from '@/components/StatusBadge';
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, CheckCircle, XCircle, List, LayoutGrid, Calendar, DollarSign, Building } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';
import { ScholarshipApplication } from '@/types';
import { api } from '@/lib/api';

type ViewMode = 'list' | 'grid';

const AllApplicationsPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedApp, setSelectedApp] = useState<ScholarshipApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const isMunicipal = user?.role === 'municipal';

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', 'all'],
    queryFn: () => api.getApplications(),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' | 'review' }) =>
      api.updateApplicationStatus(id, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });

  const searchValue = search.toLowerCase();
  const apps = applications
    .filter((application) => statusFilter === 'all' || application.status === statusFilter)
    .filter((application) =>
      application.studentName.toLowerCase().includes(searchValue) ||
      application.reference.toLowerCase().includes(searchValue) ||
      application.university.toLowerCase().includes(searchValue),
    );

  const handleViewDetail = (application: ScholarshipApplication) => {
    setSelectedApp(application);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-hero px-6 py-6 md:px-8 md:py-7">
        <h1 className="text-2xl font-bold font-heading">{isMunicipal ? 'Demandes assignées' : 'Toutes les demandes'}</h1>
        <p className="text-sm text-muted-foreground">{apps.length} demande(s)</p>
      </div>

      <Card className="dashboard-surface">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par référence, étudiant ou université..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Statut" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="submitted">Soumise</SelectItem>
                  <SelectItem value="review">En analyse</SelectItem>
                  <SelectItem value="approved">Approuvée</SelectItem>
                  <SelectItem value="rejected">Refusée</SelectItem>
                </SelectContent>
              </Select>
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
            <p className="text-sm text-muted-foreground">Chargement des demandes...</p>
          ) : viewMode === 'list' ? (
            <div className="dashboard-table-shell overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Université</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apps.map((application) => (
                    <TableRow key={application.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{application.reference}</TableCell>
                      <TableCell className="font-medium">{application.studentName}</TableCell>
                      <TableCell>{application.university}</TableCell>
                      <TableCell>{application.program}</TableCell>
                      <TableCell>{formatCurrency(application.amount)}</TableCell>
                      <TableCell><StatusBadge status={application.status} /></TableCell>
                      <TableCell className="text-sm">{formatDate(application.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetail(application)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isMunicipal && (application.status === 'submitted' || application.status === 'review') && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={() => updateStatus.mutate({ id: application.id, status: 'approved' })}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => updateStatus.mutate({ id: application.id, status: 'rejected' })}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((application) => (
                <div key={application.id} className="dashboard-surface p-5 transition-all cursor-pointer hover:-translate-y-1" onClick={() => handleViewDetail(application)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#DBEAFE] flex items-center justify-center text-sm font-bold text-primary">
                        {application.studentName.split(' ').map((part) => part[0]).join('')}
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
            </div>
          )}
        </CardContent>
      </Card>

      <ApplicationDetailDialog
        application={selectedApp}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onApprove={isMunicipal ? (application) => updateStatus.mutate({ id: application.id, status: 'approved' }) : undefined}
        onReject={isMunicipal ? (application) => updateStatus.mutate({ id: application.id, status: 'rejected' }) : undefined}
        isActionPending={updateStatus.isPending}
      />
    </div>
  );
};

export default AllApplicationsPage;
