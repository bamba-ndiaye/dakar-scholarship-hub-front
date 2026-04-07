// Dialog pour le profil et les paramètres
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, Settings, Shield, Bell, Palette, Save, 
  Check, ChevronRight, Mail, Phone, MapPin, Calendar,
  Building, GraduationCap, Edit
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TABS = [
  { id: 'profile', title: 'Profil', icon: User, description: 'Informations personnelles' },
  { id: 'security', title: 'Sécurité', icon: Shield, description: 'Mot de passe & sécurité' },
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Préférences de notification' },
  { id: 'appearance', title: 'Apparence', icon: Palette, description: 'Thème & affichage' },
];

const STEPS = [
  { id: 1, title: 'Informations', description: 'Identité & contact' },
  { id: 2, title: 'Complément', description: 'Adresse & profil' },
  { id: 3, title: 'Sécurité', description: 'Mot de passe' },
];

const ProfileSettingsDialog = ({ open, onOpenChange }: ProfileSettingsDialogProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const progress = (currentStep / STEPS.length) * 100;
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : '??';

  const handleSave = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres du compte
          </DialogTitle>
          <DialogDescription>
            Gérez vos informations personnelles et vos préférences.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 shrink-0 border-r border-white/10 bg-[#0B1220] p-4 hidden md:block text-white">
            {/* Avatar et nom */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarFallback className="text-2xl bg-white text-[#2563EB]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" className="absolute bottom-0 right-0 h-7 w-7 rounded-full">
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
              <h3 className="font-semibold mt-3">{user?.firstName} {user?.lastName}</h3>
              <p className="text-sm text-white/70">{user?.email}</p>
            </div>

            {/* Onglets */}
            <nav className="space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "bg-[#2563EB] text-white shadow-[0_14px_30px_rgba(37,99,235,0.35)]"
                      : "text-white/80 hover:bg-white/6 hover:text-white"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.title}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations personnelles
                  </h2>
                  <p className="text-sm text-muted-foreground">Complétez votre profil pour une meilleure expérience.</p>
                </div>

                {/* Indicateur de progression */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression du profil</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {STEPS.map(step => (
                      <span key={step.id} className={cn(currentStep >= step.id && "text-foreground font-medium")}>
                        {step.title}
                      </span>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Formulaire */}
                <div className="space-y-4">
                  {currentStep === 1 && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input 
                          id="firstName" 
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input 
                          id="lastName" 
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input 
                          id="phone" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Textarea 
                          id="address" 
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          placeholder="Votre adresse complète"
                        />
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}>
                    Précédent
                  </Button>
                  {currentStep < 3 ? (
                    <Button onClick={() => setCurrentStep(currentStep + 1)}>
                      Suivant
                    </Button>
                  ) : (
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </Button>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Sécurité
                  </h2>
                  <p className="text-sm text-muted-foreground">Gérez la sécurité de votre compte.</p>
                </div>
                <Card className="dashboard-surface">
                  <CardHeader>
                    <CardTitle className="text-base">Changer le mot de passe</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Mot de passe actuel</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nouveau mot de passe</Label>
                      <Input type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmer le mot de passe</Label>
                      <Input type="password" />
                    </div>
                    <Button>Mettre à jour</Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </h2>
                  <p className="text-sm text-muted-foreground">Configurez vos préférences de notification.</p>
                </div>
                <Card className="dashboard-surface">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifications par email</p>
                        <p className="text-sm text-muted-foreground">Recevoir des mises à jour par email</p>
                      </div>
                      <Button variant="outline">Activé</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notifications push</p>
                        <p className="text-sm text-muted-foreground">Recevoir des notifications dans le navigateur</p>
                      </div>
                      <Button variant="outline">Activé</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Apparence
                  </h2>
                  <p className="text-sm text-muted-foreground">Personnalisez l'apparence de l'application.</p>
                </div>
                <Card className="dashboard-surface">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Thème</Label>
                      <Select defaultValue="light">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Clair</SelectItem>
                          <SelectItem value="dark">Sombre</SelectItem>
                          <SelectItem value="system">Système</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileSettingsDialog;
