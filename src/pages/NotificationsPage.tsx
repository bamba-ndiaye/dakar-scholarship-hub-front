import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/utils/helpers';
import { api } from '@/lib/api';

const typeIcons = {
  status_update: '📋',
  new_message: '💬',
  assignment: '📌',
  system: '⚙️',
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'page'],
    queryFn: () => api.getNotifications(50),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      <div className="dashboard-hero flex items-center justify-between px-6 py-6 md:px-8 md:py-7">
        <div>
          <h1 className="text-2xl font-bold font-heading">Notifications</h1>
          <p className="text-sm text-muted-foreground">{notifications.length} notification(s)</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => markAllRead.mutate()}>
          <CheckCircle2 className="h-3 w-3" /> Tout marquer comme lu
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement des notifications...</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`dashboard-surface transition-all hover:-translate-y-0.5 ${!notification.read ? 'border-primary/20 bg-primary/5' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">{typeIcons[notification.type]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(notification.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {notifications.length === 0 && <p className="text-sm text-muted-foreground">Aucune notification disponible.</p>}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
