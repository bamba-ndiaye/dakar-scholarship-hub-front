// Barre de navigation supérieure
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Menu, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import NotificationDropdown from '@/components/NotificationDropdown';
import ProfileSettingsDialog from '@/components/ProfileSettingsDialog';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface TopbarProps {
  onMenuClick: () => void;
}

const roleLabels: Record<UserRole, string> = {
  student: 'Étudiant',
  municipal: 'Responsable Municipal',
  admin: 'Administrateur',
};

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return '??';
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const initials = user ? getInitials(user.firstName, user.lastName) : '??';

  return (
    <header className={cn(
      'h-14 border-b border-border bg-white text-foreground flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm',
      'mx-4 mt-4 h-auto min-h-[76px] rounded-[28px] border-[#1D4ED8]/10 bg-[linear-gradient(135deg,#2563EB_0%,#1D4ED8_100%)] px-4 py-3 text-white shadow-[0_20px_45px_rgba(37,99,235,0.24)] md:mx-6 md:mt-5 md:px-5',
    )}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'lg:hidden text-foreground hover:bg-primary/5 hover:text-primary',
            'text-white hover:bg-white/10 hover:text-white',
          )}
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-1 items-center gap-4 min-w-0">
          <div className="hidden md:flex h-11 max-w-md flex-1 items-center rounded-full border border-white/20 bg-white/10 px-4 backdrop-blur-sm">
            <p className="text-xs text-white/80">
              Connecté en tant que <span className="font-medium text-white">{user ? roleLabels[user.role] : ''}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationDropdown />

        <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'gap-2 px-2 text-foreground hover:bg-primary/5 hover:text-primary transition-colors',
                'h-11 rounded-full border border-white/15 bg-white/10 px-2.5 text-white hover:bg-white/15 hover:text-white',
              )}
            >
              <Avatar className={cn('h-8 w-8 ring-2 ring-primary/10', 'ring-white/15')}>
                <AvatarFallback className={cn(
                  'bg-primary text-primary-foreground text-xs font-bold',
                  'bg-white text-[#2563EB]',
                )}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className={cn('text-sm font-medium leading-none text-foreground', 'text-white')}>{user?.firstName} {user?.lastName}</span>
                <span className={cn('text-xs text-muted-foreground mt-1', 'text-white/75')}>{user ? roleLabels[user.role] : ''}</span>
              </div>
              <ChevronDown className={cn('h-4 w-4 text-muted-foreground hidden md:block', 'text-white/75')} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setProfileOpen(true); setIsUserMenuOpen(false); }} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" /> Mon profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setProfileOpen(true); setIsUserMenuOpen(false); }} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" /> Paramètres
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ProfileSettingsDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
};

export default Topbar;
