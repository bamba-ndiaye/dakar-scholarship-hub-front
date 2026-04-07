// Sidebar de navigation avec items basés sur le rôle
import { useAuth } from '@/context/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';
import {
  LayoutDashboard, FileText, MessageSquare, Bell, Settings, Users, BarChart3, ClipboardList, X, GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import NewApplicationDialog from '@/components/NewApplicationDialog';

interface SidebarNavProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Tableau de bord', path: '/dashboard/student', icon: LayoutDashboard, roles: ['student'] },
  { label: 'Tableau de bord', path: '/dashboard/municipal', icon: LayoutDashboard, roles: ['municipal'] },
  { label: 'Tableau de bord', path: '/dashboard/admin', icon: LayoutDashboard, roles: ['admin'] },
  { label: 'Mes demandes', path: '/applications', icon: FileText, roles: ['student'] },
  { label: 'Demandes', path: '/applications', icon: ClipboardList, roles: ['municipal'] },
  { label: 'Toutes les demandes', path: '/applications', icon: ClipboardList, roles: ['admin'] },
  { label: 'Messages', path: '/messages', icon: MessageSquare, roles: ['student', 'municipal'] },
  { label: 'Notifications', path: '/notifications', icon: Bell, roles: ['student', 'municipal'] },
  { label: 'Utilisateurs', path: '/users', icon: Users, roles: ['admin'] },
  { label: 'Statistiques', path: '/analytics', icon: BarChart3, roles: ['admin'] },
  { label: 'Paramètres', path: '/settings', icon: Settings, roles: ['student', 'municipal', 'admin'] },
];

const SidebarNav = ({ open, onClose }: SidebarNavProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role || 'student';
  const filtered = navItems.filter(item => item.roles.includes(role));

  const getRoleBadge = () => {
    switch (role) {
      case 'student':
        return { label: 'Espace Étudiant', color: 'bg-white/12 text-white border-white/15' };
      case 'municipal':
        return { label: 'Espace Municipal', color: 'bg-white/12 text-white border-white/15' };
      case 'admin':
        return { label: 'Espace Admin', color: 'bg-white/12 text-white border-white/15' };
      default:
        return { label: 'Dashboard', color: 'bg-white/12 text-white border-white/15' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      {open && <div className="fixed inset-0 bg-foreground/30 z-40 lg:hidden" onClick={onClose} />}

      <aside className={cn(
        `
        fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-xl
        transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto lg:sticky lg:top-0
        `,
        open ? 'translate-x-0' : '-translate-x-full',
        'w-72 border-r-0 bg-[#0B1220] text-white lg:h-screen lg:rounded-none lg:border-r lg:border-white/5 lg:shadow-[0_28px_60px_rgba(15,23,42,0.28)]',
      )}>
        <div className={cn(
          'h-14 flex items-center justify-between px-4 border-b border-sidebar-border',
          'h-20 px-6 border-white/10',
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-8 w-8 rounded-lg bg-white/12 flex items-center justify-center shadow-md border border-white/10',
              'h-11 w-11 rounded-2xl bg-white/8 border-white/10 shadow-none',
            )}>
              <GraduationCap className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold font-heading text-white">Bourses Dakar</h1>
              <p className="text-[10px] text-white/65">Mairie de Dakar</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10 hover:text-white" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className={cn(
          'px-4 py-3 border-b border-sidebar-border',
          'px-6 py-4 border-white/10',
        )}>
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
            roleBadge.color,
            'bg-white/6 border-white/10 px-3 py-1',
          )}>
            {roleBadge.label}
          </span>
        </div>

        <ScrollArea className={cn('flex-1 py-3', 'py-5')}>
          <nav className={cn('px-3 space-y-1', 'px-4 space-y-2')}>
            {filtered.map(item => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));

              if (item.path === '/applications/new' && role === 'student') {
                return (
                  <NewApplicationDialog key={item.path}>
                    <button
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer',
                        location.pathname === item.path
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-white/80 hover:bg-white/10 hover:text-white',
                        location.pathname === item.path
                          ? 'rounded-2xl bg-[#2563EB] px-4 py-3 text-white shadow-[0_14px_30px_rgba(37,99,235,0.35)]'
                          : 'rounded-2xl px-4 py-3 text-white/78 hover:bg-white/6 hover:text-white',
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  </NewApplicationDialog>
                );
              }

              return (
                <NavLink
                  key={item.path + item.label}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white',
                    isActive
                      ? 'rounded-2xl bg-[#2563EB] px-4 py-3 text-white shadow-[0_14px_30px_rgba(37,99,235,0.35)]'
                      : 'rounded-2xl px-4 py-3 text-white/78 hover:bg-white/6 hover:text-white',
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        <div className={cn(
          'p-4 border-t border-sidebar-border',
          'px-6 py-5 border-white/10',
        )}>
          <p className="text-[10px] text-white/55 text-center">© 2024 Mairie de Dakar</p>
        </div>
      </aside>
    </>
  );
};

export default SidebarNav;
