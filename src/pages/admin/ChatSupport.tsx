import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  is_read: boolean;
  created_at: string;
}

interface ChatUser {
  user_id: string;
  full_name: string;
  email: string;
  unread_count: number;
}

const ChatSupport = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatUsers();
    
    const channel = supabase
      .channel('chat-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => {
        loadChatUsers();
        if (selectedUserId) loadMessages(selectedUserId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
      markAsRead(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatUsers = async () => {
    const { data: messagesData } = await supabase
      .from('chat_messages')
      .select('user_id')
      .neq('user_id', user?.id);

    if (messagesData) {
      const userMap = new Map<string, ChatUser>();
      const uniqueUserIds = [...new Set(messagesData.map(m => m.user_id))];
      
      for (const userId of uniqueUserIds) {
        if (!userMap.has(userId)) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', userId)
            .single();

          const { count } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_admin', false)
            .eq('is_read', false);

          userMap.set(userId, {
            user_id: userId,
            full_name: profile?.full_name || 'Unknown',
            email: profile?.email || '',
            unread_count: count || 0,
          });
        }
      }

      setChatUsers(Array.from(userMap.values()));
    }
  };

  const loadMessages = async (userId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const markAsRead = async (userId: string) => {
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_admin', false)
      .eq('is_read', false);
    
    loadChatUsers();
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      const { error } = await supabase.from('chat_messages').insert({
        user_id: selectedUserId,
        message: newMessage,
        is_admin: true,
      });

      if (error) throw error;
      setNewMessage('');
      loadMessages(selectedUserId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Chat Support</h1>
        <p className="text-muted-foreground">Respond to user messages and support requests</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Active Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {chatUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 px-4">No messages yet</p>
              ) : (
                <div className="space-y-1 p-2">
                  {chatUsers.map((chatUser) => (
                    <button
                      key={chatUser.user_id}
                      onClick={() => setSelectedUserId(chatUser.user_id)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedUserId === chatUser.user_id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{chatUser.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{chatUser.full_name}</p>
                          <p className="text-xs opacity-70 truncate">{chatUser.email}</p>
                        </div>
                        {chatUser.unread_count > 0 && (
                          <div className="bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs font-bold">
                            {chatUser.unread_count}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedUserId
                ? chatUsers.find(u => u.user_id === selectedUserId)?.full_name || 'Chat'
                : 'Select a conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUserId ? (
              <div className="space-y-4">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.is_admin
                              ? 'bg-gradient-hero text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <Button onClick={handleSend}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                Select a conversation to start chatting
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatSupport;