// Page paramètres / profil - affiche le popup de paramètres
import { useState } from 'react';
import ProfileSettingsDialog from '@/components/ProfileSettingsDialog';

const SettingsPage = () => {
  const [profileOpen, setProfileOpen] = useState(true);

  return (
    <div className="space-y-8 p-0 animate-fade-in">
      <div className="dashboard-hero px-6 py-6 md:px-8 md:py-7">
        <h1 className="text-2xl font-bold mb-4">Paramètres</h1>
        <p className="text-muted-foreground mb-0">
          Gérez vos paramètres de profil, sécurité et notifications.
        </p>
      </div>
      <ProfileSettingsDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

export default SettingsPage;
