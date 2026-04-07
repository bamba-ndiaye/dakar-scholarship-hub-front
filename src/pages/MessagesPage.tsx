import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/utils/helpers';
import { api } from '@/lib/api';

const MessagesPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedConv, setSelectedConv] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.getConversations(),
  });

  useEffect(() => {
    if (!selectedConv && conversations[0]?.id) {
      setSelectedConv(conversations[0].id);
    }
  }, [conversations, selectedConv]);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConv],
    queryFn: () => api.getMessages(selectedConv),
    enabled: !!selectedConv,
  });

  const sendMessage = useMutation({
    mutationFn: (content: string) => api.sendMessage(selectedConv, content),
    onSuccess: async () => {
      setNewMessage('');
      await queryClient.invalidateQueries({ queryKey: ['messages', selectedConv] });
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const otherParticipant = (conversationId: string) => {
    const conversation = conversations.find((item) => item.id === conversationId);
    return conversation?.participants.find((participant) => participant.id !== user?.id)?.name || '';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="dashboard-hero px-6 py-6 md:px-8 md:py-7">
        <h1 className="text-2xl font-bold font-heading">Messages</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-13rem)]">
        <Card className="dashboard-surface md:col-span-1 overflow-hidden">
          <div className="p-3 border-b">
            <Input placeholder="Rechercher..." className="h-8 text-sm" />
          </div>
          <ScrollArea className="h-[calc(100%-3.5rem)]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b cursor-pointer transition-colors ${selectedConv === conversation.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-slate-50/80'}`}
                onClick={() => setSelectedConv(conversation.id)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{otherParticipant(conversation.id)}</p>
                  {conversation.unreadCount > 0 && (
                    <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{conversation.lastMessage}</p>
              </div>
            ))}
          </ScrollArea>
        </Card>

        <Card className="dashboard-surface md:col-span-2 flex flex-col overflow-hidden">
          {selectedConv ? (
            <>
              <div className="p-3 border-b">
                <p className="font-medium text-sm">{otherParticipant(selectedConv)}</p>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-[20px] p-3 ${message.senderId === user?.id ? 'bg-[#2563EB] text-primary-foreground shadow-[0_12px_28px_rgba(37,99,235,0.24)]' : 'bg-slate-100'}`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-[10px] mt-1 ${message.senderId === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {formatDateTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-3 border-t flex gap-2">
                <Input
                  placeholder="Écrire un message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      sendMessage.mutate(newMessage.trim());
                    }
                  }}
                />
                <Button size="icon" onClick={() => newMessage.trim() && sendMessage.mutate(newMessage.trim())}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;
