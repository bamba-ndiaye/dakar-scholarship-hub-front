import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, X, FileText, Save, Send } from 'lucide-react';
import { toast } from 'sonner';
import ApplicantSummaryCard from '@/components/ApplicantSummaryCard';
import { api } from '@/lib/api';
import { Document } from '@/types';

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

const NewApplicationPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

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
      navigate('/applications');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de soumettre la demande';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="dashboard-hero flex items-center gap-3 px-6 py-6 md:px-8 md:py-7">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-heading">Nouvelle demande de bourse</h1>
          <p className="text-sm text-muted-foreground">Nous reutilisons vos informations de profil et nous vous demandons uniquement les informations propres au dossier.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <ApplicantSummaryCard />

        <Card className="dashboard-surface">
          <CardHeader>
            <CardTitle className="text-base font-heading">Informations academiques</CardTitle>
            <CardDescription>Renseignez vos informations universitaires</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="university">Universite / Ecole</Label>
              <Input id="university" placeholder="Ex: Universite Cheikh Anta Diop" required value={form.university} onChange={(event) => setForm((prev) => ({ ...prev, university: event.target.value }))} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="program">Filiere / Programme</Label>
                <Input id="program" placeholder="Ex: Informatique" required value={form.program} onChange={(event) => setForm((prev) => ({ ...prev, program: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Niveau</Label>
                <Select value={form.level} onValueChange={(value) => setForm((prev) => ({ ...prev, level: value }))}>
                  <SelectTrigger><SelectValue placeholder="Selectionner" /></SelectTrigger>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Annee academique</Label>
                <Select value={form.year} onValueChange={(value) => setForm((prev) => ({ ...prev, year: value }))}>
                  <SelectTrigger><SelectValue placeholder="Selectionner" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                    <SelectItem value="2026-2027">2026-2027</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Montant demande (FCFA)</Label>
                <Input id="amount" type="number" placeholder="Ex: 500000" required min="0" value={form.amount} onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-surface">
          <CardHeader>
            <CardTitle className="text-base font-heading">Lettre de motivation</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea placeholder="Expliquez pourquoi vous meritez cette bourse..." className="min-h-[120px]" required value={form.motivation} onChange={(event) => setForm((prev) => ({ ...prev, motivation: event.target.value }))} />
          </CardContent>
        </Card>

        <Card className="dashboard-surface">
          <CardHeader>
            <CardTitle className="text-base font-heading">Documents requis</CardTitle>
            <CardDescription>Les fichiers selectionnes seront televerses vers le backend avant la creation de votre demande.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
              onDragOver={event => { event.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={event => { event.preventDefault(); setDragOver(false); addFiles(event.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Glissez-deposez vos fichiers ici</p>
              <p className="text-xs text-muted-foreground mt-1">ou cliquez pour parcourir · PDF, JPG, PNG (max 10 Mo)</p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
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
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button type="button" variant="outline" onClick={handleSaveDraft} className="gap-2" disabled={isSubmitting}>
            <Save className="h-4 w-4" /> Enregistrer brouillon
          </Button>
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            <Send className="h-4 w-4" /> {isSubmitting ? 'Envoi...' : 'Soumettre la demande'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewApplicationPage;
