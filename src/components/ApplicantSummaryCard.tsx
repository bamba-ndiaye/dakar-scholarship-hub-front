import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Phone, User } from 'lucide-react';

const ApplicantSummaryCard = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card className="dashboard-surface border-primary/15 bg-[linear-gradient(180deg,rgba(239,246,255,0.92)_0%,rgba(255,255,255,1)_100%)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-heading flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          Demandeur
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm font-medium">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground">
            Ces informations proviennent de votre profil et seront associees a votre dossier.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="dashboard-row flex items-start gap-2 p-3 text-sm">
            <Mail className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="break-all">{user.email}</p>
            </div>
          </div>

          <div className="dashboard-row flex items-start gap-2 p-3 text-sm">
            <Phone className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Telephone</p>
              <p>{user.phone || 'Non renseigne'}</p>
            </div>
          </div>

          <div className="dashboard-row flex items-start gap-2 p-3 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Adresse</p>
              <p>{user.address || 'Non renseignee'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicantSummaryCard;
