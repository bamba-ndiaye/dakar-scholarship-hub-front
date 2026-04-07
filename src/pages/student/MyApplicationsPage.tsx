import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import StatusBadge from '@/components/StatusBadge';
import NewApplicationDialog from '@/components/NewApplicationDialog';
import ApplicationDetailDialog from '@/components/ApplicationDetailDialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Eye, LayoutGrid, List, Calendar, DollarSign, Building } from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { ScholarshipApplication } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type ViewMode = 'list' | 'grid';

const MyApplicationsPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedApp, setSelectedApp] = useState<ScholarshipApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', 'my'],
    queryFn: () => api.getMyApplications(),
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

  const searchValue = search.toLowerCase();
  const myApps = applications
    .filter((application) => statusFilter === 'all' || application.status === statusFilter)
    .filter((application) =>
      application.university.toLowerCase().includes(searchValue) ||
      application.reference.toLowerCase().includes(searchValue),
    );

  const handleViewDetail = (application: ScholarshipApplication) => {
    setSelectedApp(application);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-hero flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8 md:py-7">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold font-heading">Mes demandes</h1>
          <p className="text-sm text-muted-foreground">{myApps.length} demande(s) trouvée(s)</p>
        </div>
        <NewApplicationDialog>
          <Button className="gap-2 cursor-pointer">
            <PlusCircle className="h-4 w-4" /> Nouvelle demande
          </Button>
        </NewApplicationDialog>
      </div>

      <Card className="dashboard-surface">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par référence ou université..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
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
                    <TableHead>Université</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myApps.map((application) => (
                    <TableRow key={application.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">{application.reference}</TableCell>
                      <TableCell className="font-medium">{application.university}</TableCell>
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
                  {myApps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucune demande trouvée</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myApps.map((application) => (
                <div key={application.id} className="dashboard-surface p-5 transition-all cursor-pointer hover:-translate-y-1" onClick={() => handleViewDetail(application)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-xs text-muted-foreground">{application.reference}</p>
                      <StatusBadge status={application.status} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium truncate">{application.university}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{application.program}</p>
                    <div className="flex items-center gap-2 text-sm">
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
              {myApps.length === 0 && <div className="col-span-full text-center py-8 text-muted-foreground">Aucune demande trouvée</div>}
            </div>
          )}
        </CardContent>
      </Card>

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

export default MyApplicationsPage;
