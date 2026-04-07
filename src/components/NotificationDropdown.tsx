import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDateTime } from '@/utils/helpers';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const NotificationDropdown = () => {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'dropdown'],
    queryFn: () => api.getNotifications(5),
  });

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative',
            'rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/15 hover:text-white',
          )}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-2xl border border-slate-200/80 p-0 shadow-[0_18px_40px_rgba(15,23,42,0.12)]" align="end">
        <div className="p-3 border-b">
          <h4 className="font-semibold font-heading text-sm">Notifications</h4>
        </div>
        <ScrollArea className="h-64">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
            >
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatDateTime(notification.createdAt)}</p>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground text-center">Aucune notification</p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
