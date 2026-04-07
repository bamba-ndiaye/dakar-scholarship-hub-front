// Page mot de passe oublié
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  if (sent) {
    return (
      <Card className="border-0 shadow-none lg:shadow-sm lg:border text-center">
        <CardContent className="pt-8 pb-6 space-y-4">
          <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <CheckCircle className="h-6 w-6 text-success" />
          </div>
          <h2 className="text-xl font-bold font-heading">Email envoyé</h2>
          <p className="text-sm text-muted-foreground">Vérifiez votre boîte de réception pour le lien de réinitialisation.</p>
          <Link to="/login">
            <Button variant="outline" className="mt-2"><ArrowLeft className="mr-2 h-4 w-4" />Retour à la connexion</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-none lg:shadow-sm lg:border">
      <CardHeader>
        <CardTitle className="text-2xl font-heading">Mot de passe oublié</CardTitle>
        <CardDescription>Entrez votre email pour recevoir un lien de réinitialisation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input id="email" type="email" placeholder="votre@email.sn" required />
          </div>
          <Button type="submit" className="w-full">Envoyer le lien</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          <Link to="/login" className="text-primary hover:underline flex items-center justify-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Retour à la connexion
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordPage;
