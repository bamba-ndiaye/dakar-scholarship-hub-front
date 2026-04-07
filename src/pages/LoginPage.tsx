import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2, AlertCircle, GraduationCap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const roleRedirects = {
  student: '/dashboard/student',
  municipal: '/dashboard/municipal',
  admin: '/dashboard/admin',
};

const LOGIN_ERROR_MESSAGE = "Email ou mot de passe incorrect. Veuillez vous inscrire si vous n'avez pas de compte.";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login, isAuthenticated, isLoading: authLoading, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !authLoading && user) {
      navigate(roleRedirects[user.role]);
    }
  }, [isAuthenticated, authLoading, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword || !EMAIL_PATTERN.test(normalizedEmail)) {
      setFormError(LOGIN_ERROR_MESSAGE);
      return;
    }

    setLoading(true);
    const result = await login(normalizedEmail, password);
    setLoading(false);

    if (result.success) {
      return;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold font-heading text-primary">Bourses Dakar</p>
          <p className="text-xs text-muted-foreground">Plateforme de gestion des bourses</p>
        </div>
      </div>

      <Card className="border border-border/80 bg-card shadow-xl shadow-slate-200/60">
        <CardHeader className="space-y-2 pb-4">
          <CardTitle className="text-2xl font-heading text-primary">Connexion</CardTitle>
          <CardDescription>Entrez vos identifiants pour acceder a votre espace</CardDescription>
        </CardHeader>
        <CardContent>
          {(formError || error) && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {formError || error}{' '}
                <Link to="/register" className="font-semibold underline underline-offset-2">
                  S'inscrire
                </Link>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                className="h-11 border-border bg-white"
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline">Mot de passe oublie ?</Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formError) setFormError(null);
                    if (error) clearError();
                  }}
                  className="h-11 border-border bg-white pr-10"
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="h-11 w-full bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/95" disabled={loading || authLoading}>
              {loading || authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">S'inscrire</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
