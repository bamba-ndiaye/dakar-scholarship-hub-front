import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Save, Send, PlusCircle, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ApplicantSummaryCard from '@/components/ApplicantSummaryCard';
import { api } from '@/lib/api';
import { Document } from '@/types';

interface NewApplicationDialogProps {
  children: React.ReactNode;
}

const STEPS = [
  { id: 1, title: 'Academie', description: 'Universite et formation' },
  { id: 2, title: 'Motivation', description: 'Lettre de motivation' },
  { id: 3, title: 'Documents', description: 'Pieces jointes' },
];

const initialForm = {
  university: '',
  program: '',
  level: '',
  year: '',
  amount: '',
  motivation: '',
};

function inferDocumentType(fileName: string): Document['type'] {
  const lower = fileName.toLowerCase();

  if (lower.includes('diplome') || lower.includes('diploma')) return 'diploma';
  if (lower.includes('carte') || lower.includes('card')) return 'student_card';
  if (lower.includes('releve') || lower.includes('transcript')) return 'transcript';
  if (lower.includes('certificat') || lower.includes('certificate') || lower.includes('enrollment')) return 'enrollment_certificate';

  return 'other';
}

const NewApplicationDialog = ({ children }: NewApplicationDialogProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const progress = (currentStep / STEPS.length) * 100;

  const canGoNext = useMemo(() => {
    if (currentStep === 1) {
      return Boolean(form.university && form.program && form.level && form.year && form.amount);
    }

    if (currentStep === 2) {
      return Boolean(form.motivation.trim());
    }

    return true;
  }, [currentStep, form]);

  const resetState = () => {
    setCurrentStep(1);
    setFiles([]);
    setDragOver(false);
    setForm(initialForm);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addFiles = (incoming: FileList | File[]) => {
    const normalized = Array.from(incoming);
    setFiles((prev) => [...prev, ...normalized]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async () => {
    return Promise.all(
      files.map(async (file) => {
        const uploaded = await api.uploadDocument(file);
        return {
          name: uploaded.originalName,
          type: inferDocumentType(uploaded.originalName),
          fileType: uploaded.mimeType,
          size: uploaded.bytes,
          url: uploaded.url,
        };
      }),
    );
  };

  const buildPayload = async () => ({
    university: form.university.trim(),
    program: form.program.trim(),
    level: form.level,
    year: form.year,
    amount: Number(form.amount),
    motivation: form.motivation.trim(),
    documents: await uploadDocuments(),
  });

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true);
      const payload = await buildPayload();
      await api.createApplication(payload);
      toast.success('Brouillon enregistre avec succes');
      setOpen(false);
      resetState();
      navigate('/applications');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible d enregistrer le brouillon';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const payload = await buildPayload();
      const created = await api.createApplication(payload);
      await api.submitApplication(created.id);
      toast.success('Demande soumise avec succes');
      setOpen(false);
      resetState();
      navigate('/applications');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de soumettre la demande';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length && canGoNext) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetState();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Nouvelle demande de bourse
          </DialogTitle>
          <DialogDescription>
            Nous reutilisons vos informations de profil et nous vous demandons seulement les elements utiles au dossier.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 py-4 border-b">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all',
                    currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : currentStep === step.id
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-slate-100 text-muted-foreground',
                  )}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={cn('w-12 h-0.5 mx-1', currentStep > step.id ? 'bg-green-500' : 'bg-slate-200')} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {STEPS.map((step) => (
              <span key={step.id} className={cn(currentStep === step.id && 'text-foreground font-medium')}>
                {step.title}
              </span>
            ))}
          </div>
          <Progress value={progress} className="mt-3 h-1.5" />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          <ApplicantSummaryCard />

          {currentStep === 1 && (
            <div className="dashboard-surface space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                Informations academiques
              </h3>
              <div className="space-y-2">
                <Label htmlFor="university">Universite / Ecole</Label>
                <Input
                  id="university"
                  placeholder="Ex: Universite Cheikh Anta Diop"
                  required
                  value={form.university}
                  onChange={(event) => setForm((prev) => ({ ...prev, university: event.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program">Filiere / Programme</Label>
                  <Input
                    id="program"
                    placeholder="Ex: Informatique"
                    required
                    value={form.program}
                    onChange={(event) => setForm((prev) => ({ ...prev, program: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Niveau d etudes</Label>
                  <Select value={form.level} onValueChange={(value) => setForm((prev) => ({ ...prev, level: value }))}>
                    <SelectTrigger><SelectValue placeholder="Selectionner le niveau" /></SelectTrigger>
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
                  <Label htmlFor="year">Annee academique</Label>
                  <Select value={form.year} onValueChange={(value) => setForm((prev) => ({ ...prev, year: value }))}>
                    <SelectTrigger><SelectValue placeholder="Selectionner l annee" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024-2025">2024-2025</SelectItem>
                      <SelectItem value="2025-2026">2025-2026</SelectItem>
                      <SelectItem value="2026-2027">2026-2027</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant demande (FCFA)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Ex: 500000"
                    required
                    min="0"
                    value={form.amount}
                    onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="dashboard-surface space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                Lettre de motivation
              </h3>
              <p className="text-sm text-muted-foreground">
                Expliquez pourquoi vous meritez cette bourse et quelles sont vos ambitions academiques.
              </p>
              <Textarea
                placeholder="Madame, Monsieur,\n\nJe souhaiterais obtenir une bourse d etudes pour..."
                className="min-h-[200px]"
                required
                value={form.motivation}
                onChange={(event) => setForm((prev) => ({ ...prev, motivation: event.target.value }))}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="dashboard-surface space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 p-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                Documents requis
              </h3>
              <p className="text-sm text-muted-foreground">
                Les fichiers selectionnes seront televerses vers le backend avant la creation de votre demande.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) {
                    addFiles(event.target.files);
                  }
                }}
              />

              <div
                className={`dashboard-dropzone p-8 text-center transition-colors cursor-pointer ${dragOver ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(false);
                  addFiles(event.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">Glissez-deposez vos fichiers ici</p>
                <p className="text-xs text-muted-foreground mt-1">ou cliquez pour parcourir · PDF, JPG, PNG (max 10 Mo)</p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Fichiers selectionnes ({files.length})</p>
                  {files.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="dashboard-file-row flex items-center justify-between p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} Ko</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" type="button" onClick={() => removeFile(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        <div className="shrink-0 flex items-center justify-between pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleSaveDraft} className="gap-2" disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            Brouillon
          </Button>

          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep} className="gap-1" disabled={isSubmitting}>
                <ChevronLeft className="h-4 w-4" />
                Precedent
              </Button>
            )}
            {currentStep < STEPS.length ? (
              <Button type="button" onClick={nextStep} className="gap-1" disabled={!canGoNext || isSubmitting}>
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" onClick={handleSubmit} className="gap-2" disabled={isSubmitting}>
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Envoi...' : 'Soumettre'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewApplicationDialog;
