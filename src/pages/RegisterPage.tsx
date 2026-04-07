import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, GraduationCap, Info } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();

  useEffect(() => {
    const emailFromLogin = searchParams.get('email');
    if (emailFromLogin) {
      setEmail(emailFromLogin);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setFormError(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !password || !confirmPassword) {
      setFormError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setFormError('Veuillez saisir une adresse email valide.');
      return;
    }

    if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone.replace(/[\s-]/g, ''))) {
      setFormError('Veuillez saisir un numero de telephone valide.');
      return;
    }

    if (password.length < 8) {
      setFormError('Le mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const result = await register({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
      phone: trimmedPhone,
      password,
    });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard/student');
    }
  };

  const redirectedFromLogin = searchParams.get('from') === 'login';

  return (
    <div>
      <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold font-heading">Bourses Dakar</span>
      </div>

      <Card className="border-0 shadow-none lg:shadow-sm lg:border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-heading">Inscription</CardTitle>
          <CardDescription>Creez votre compte etudiant</CardDescription>
        </CardHeader>
        <CardContent>
          {redirectedFromLogin && (
            <Alert className="mb-4 border-primary/20 bg-primary/5 text-foreground">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription>
                Aucun compte n a ete trouve avec cet email. Vous pouvez poursuivre l inscription.
              </AlertDescription>
            </Alert>
          )}

          {(formError || error) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError ?? error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prenom</Label>
                <Input
                  id="firstName"
                  placeholder="Prenom"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (formError) setFormError(null);
                    if (error) clearError();
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  placeholder="Nom"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (formError) setFormError(null);
                    if (error) clearError();
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.sn"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError(null);
                  if (error) clearError();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telephone</Label>
              <Input
                id="phone"
                placeholder="+221 77 000 0000"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (formError) setFormError(null);
                  if (error) clearError();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 8 caracteres"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError(null);
                  if (error) clearError();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formError) setFormError(null);
                  if (error) clearError();
                }}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creation...' : "S'inscrire"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Deja un compte ?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Se connecter</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
