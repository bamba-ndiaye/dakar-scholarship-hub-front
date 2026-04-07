import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Mail, MapPin, Phone, Shield, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User as AppUser } from '@/types';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
  user?: AppUser | null;
  onCreateMunicipal?: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
  onUpdateUser?: (id: string, input: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/;

const buildInitialForm = (user?: AppUser | null) => ({
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  email: user?.email ?? '',
  phone: user?.phone ?? '',
  address: user?.address ?? '',
  password: '',
  confirmPassword: '',
});

const UserDialog = ({
  open,
  onOpenChange,
  isSubmitting = false,
  mode = 'create',
  user,
  onCreateMunicipal,
  onUpdateUser,
}: UserDialogProps) => {
  const isEditMode = mode === 'edit';
  const [formData, setFormData] = useState({
    ...buildInitialForm(user),
  });
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData(buildInitialForm(user));
    setFormError(null);
  };

  useEffect(() => {
    if (open) {
      setFormData(buildInitialForm(user));
      setFormError(null);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const address = formData.address.trim();

    if (!firstName || !lastName || !email || (!isEditMode && (!formData.password || !formData.confirmPassword))) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      setFormError('Veuillez saisir une adresse email valide.');
      return;
    }

    if (phone && !PHONE_PATTERN.test(phone.replace(/[\s-]/g, ''))) {
      setFormError('Veuillez saisir un numero de telephone valide.');
      return;
    }

    if (!isEditMode && formData.password.length < 8) {
      setFormError('Le mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    if (!isEditMode && formData.password !== formData.confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      if (isEditMode) {
        if (!user || !onUpdateUser) {
          throw new Error('La mise a jour de cet utilisateur est indisponible.');
        }

        await onUpdateUser(user.id, {
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          address: address || undefined,
        });
      } else {
        if (!onCreateMunicipal) {
          throw new Error('La creation de compte municipal est indisponible.');
        }

        await onCreateMunicipal({
          firstName,
          lastName,
          email,
          password: formData.password,
          phone: phone || undefined,
          address: address || undefined,
        });
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : isEditMode ? 'Impossible de mettre a jour le compte municipal.' : 'Impossible de creer le compte municipal.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Modifier un utilisateur' : 'Ajouter un municipal'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Mettez a jour les informations de ce compte utilisateur.'
              : 'Creez un nouveau compte municipal. L administrateur initial reste gere par le seed de la base.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6 py-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations personnelles
              </h3>
              <div className="dashboard-surface grid grid-cols-2 gap-4 p-5">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    placeholder="Prénom"
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      if (formError) setFormError(null);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    placeholder="Nom"
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      if (formError) setFormError(null);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2 dashboard-surface p-5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemple.com"
                    className="pl-9"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formError) setFormError(null);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2 dashboard-surface p-5">
                <Label htmlFor="phone">Téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+221 XX XXX XX XX"
                    className="pl-9"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (formError) setFormError(null);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse
              </h3>
              <div className="space-y-2 dashboard-surface p-5">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  placeholder="Adresse complète"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (formError) setFormError(null);
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {isEditMode ? 'Etat du compte' : 'Securite du compte'}
              </h3>
              <div className="dashboard-soft-surface px-4 py-3 text-sm">
                {isEditMode ? (
                  <>Le role de ce compte reste gere depuis l administration actuelle.</>
                ) : (
                  <>Le compte cree aura automatiquement le role <strong>MUNICIPAL</strong>.</>
                )}
              </div>
              {!isEditMode && (
                <div className="dashboard-surface grid grid-cols-2 gap-4 p-5">
                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe initial</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 caracteres"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (formError) setFormError(null);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (formError) setFormError(null);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? 'Mise a jour...' : 'Creation...') : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
