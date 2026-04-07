import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Calendar, DollarSign, Building, Clock, CheckCircle, XCircle, AlertCircle, Download, MessageSquare, Save, Send } from 'lucide-react';
import { ScholarshipApplication } from '@/types';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { useEffect, useState } from 'react';

interface ApplicationDetailDialogProps {
  application: ScholarshipApplication | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (application: ScholarshipApplication) => void;
  onReject?: (application: ScholarshipApplication) => void;
  isActionPending?: boolean;
  onSaveDraft?: (application: ScholarshipApplication, input: {
    university: string;
    program: string;
    level: string;
    year: string;
    amount: number;
    motivation: string;
  }) => void;
  onSubmitDraft?: (application: ScholarshipApplication, input: {
    university: string;
    program: string;
    level: string;
    year: string;
    amount: number;
    motivation: string;
  }) => void;
  isDraftPending?: boolean;
}

const statusConfig = {
  draft: { label: 'Brouillon', variant: 'secondary' as const, icon: FileText },
  submitted: { label: 'Soumise', variant: 'default' as const, icon: Clock },
  review: { label: 'En analyse', variant: 'outline' as const, icon: AlertCircle },
  approved: { label: 'Approuvée', variant: 'default' as const, icon: CheckCircle },
  rejected: { label: 'Refusée', variant: 'destructive' as const, icon: XCircle },
};

const ApplicationDetailDialog = ({
  application,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isActionPending = false,
  onSaveDraft,
  onSubmitDraft,
  isDraftPending = false,
}: ApplicationDetailDialogProps) => {
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'messages'>('details');
  const [draftForm, setDraftForm] = useState({
    university: '',
    program: '',
    level: '',
    year: '',
    amount: '',
    motivation: '',
  });

  useEffect(() => {
    if (application && open) {
      setActiveTab('details');
      setDraftForm({
        university: application.university,
        program: application.program,
        level: application.level,
        year: application.year,
        amount: String(application.amount ?? ''),
        motivation: application.motivation,
      });
    }
  }, [application, open]);

  if (!application) return null;

  const status = statusConfig[application.status];
  const StatusIcon = status.icon;
  const isDraftEditable = application.status === 'draft' && Boolean(onSaveDraft || onSubmitDraft);

  const normalizedDraftInput = {
    university: draftForm.university.trim(),
    program: draftForm.program.trim(),
    level: draftForm.level,
    year: draftForm.year,
    amount: Number(draftForm.amount),
    motivation: draftForm.motivation.trim(),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {application.reference}
              </DialogTitle>
              <DialogDescription>Détails de votre demande de bourse</DialogDescription>
            </div>
            <Badge variant={status.variant} className="flex items-center gap-1">
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="dashboard-tab-strip shrink-0 flex gap-1 p-1.5">
          {(['details', 'documents', 'messages'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'details' && 'Détails'}
              {tab === 'documents' && 'Documents'}
              {tab === 'messages' && 'Messages'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {isDraftEditable ? (
                <>
                  <Card className="dashboard-surface">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        Informations académiques
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Référence</p>
                          <p className="font-medium font-mono">{application.reference}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Créée le</p>
                          <p className="font-medium">{formatDate(application.createdAt)}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="draft-university">Université</Label>
                        <Input
                          id="draft-university"
                          value={draftForm.university}
                          onChange={(event) => setDraftForm((prev) => ({ ...prev, university: event.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="draft-program">Programme</Label>
                          <Input
                            id="draft-program"
                            value={draftForm.program}
                            onChange={(event) => setDraftForm((prev) => ({ ...prev, program: event.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="draft-level">Niveau</Label>
                          <Select value={draftForm.level} onValueChange={(value) => setDraftForm((prev) => ({ ...prev, level: value }))}>
                            <SelectTrigger id="draft-level">
                              <SelectValue placeholder="Selectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Licence 1">Licence 1</SelectItem>
                              <SelectItem value="Licence 2">Licence 2</SelectItem>
                              <SelectItem value="Licence 3">Licence 3</SelectItem>
                              <SelectItem value="Master 1">Master 1</SelectItem>
                              <SelectItem value="Master 2">Master 2</SelectItem>
                              <SelectItem value="Doctorat">Doctorat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="draft-year">Année académique</Label>
                          <Select value={draftForm.year} onValueChange={(value) => setDraftForm((prev) => ({ ...prev, year: value }))}>
                            <SelectTrigger id="draft-year">
                              <SelectValue placeholder="Selectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2024-2025">2024-2025</SelectItem>
                              <SelectItem value="2025-2026">2025-2026</SelectItem>
                              <SelectItem value="2026-2027">2026-2027</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="draft-amount">Montant demandé</Label>
                          <Input
                            id="draft-amount"
                            type="number"
                            min="0"
                            value={draftForm.amount}
                            onChange={(event) => setDraftForm((prev) => ({ ...prev, amount: event.target.value }))}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dashboard-surface">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Motivation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        className="min-h-[160px]"
                        value={draftForm.motivation}
                        onChange={(event) => setDraftForm((prev) => ({ ...prev, motivation: event.target.value }))}
                      />
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="dashboard-surface">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        Informations académiques
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-muted-foreground text-xs">Référence</p>
                          <p className="font-medium font-mono">{application.reference}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Université</p>
                          <p className="font-medium">{application.university}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Programme</p>
                        <p className="font-medium">{application.program}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Niveau</p>
                        <p className="font-medium">{application.level}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Année académique</p>
                        <p className="font-medium">{application.year}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="dashboard-surface bg-[linear-gradient(180deg,rgba(239,246,255,0.92)_0%,rgba(255,255,255,1)_100%)]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        Montant demandé
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(application.amount)}</p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="dashboard-surface">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          Dates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Créée le</span>
                          <span className="font-medium">{formatDate(application.createdAt)}</span>
                        </div>
                        {application.submittedAt && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Soumise le</span>
                            <span className="font-medium">{formatDate(application.submittedAt)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dernière mise à jour</span>
                          <span className="font-medium">{formatDate(application.updatedAt)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="dashboard-surface">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          Statut
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant={status.variant}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        {application.reviewNote && (
                          <div className="dashboard-row mt-2 p-3 text-xs">
                            <p className="font-medium">Note de révision:</p>
                            <p className="text-muted-foreground">{application.reviewNote}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                {application.documents && application.documents.length > 0 ? (
                  application.documents.map((doc, index) => (
                    <Card key={index} className="dashboard-surface transition-shadow cursor-pointer hover:-translate-y-0.5">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-[18px] bg-[#DBEAFE] flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.fileType} • {(doc.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={doc.url} target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun document téléversé</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun message</p>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 flex justify-between items-center pt-4 border-t">
          {isDraftEditable ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => onSaveDraft?.(application, normalizedDraftInput)}
                disabled={isDraftPending}
              >
                <Save className="h-4 w-4" />
                {isDraftPending ? 'Traitement...' : 'Enregistrer brouillon'}
              </Button>
              <Button
                className="gap-2"
                onClick={() => onSubmitDraft?.(application, normalizedDraftInput)}
                disabled={isDraftPending}
              >
                <Send className="h-4 w-4" />
                {isDraftPending ? 'Traitement...' : 'Soumettre la demande'}
              </Button>
            </div>
          ) : ((application.status === 'submitted' || application.status === 'review') && (onApprove || onReject)) ? (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => onReject?.(application)}
                disabled={isActionPending}
              >
                <XCircle className="h-4 w-4" />
                {isActionPending ? 'Traitement...' : 'Rejeter'}
              </Button>
              <Button
                variant="default"
                className="gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => onApprove?.(application)}
                disabled={isActionPending}
              >
                <CheckCircle className="h-4 w-4" />
                Approuver
              </Button>
            </div>
          ) : (
            <div />
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationDetailDialog;
