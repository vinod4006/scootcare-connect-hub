import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useFAQMatcher } from "@/hooks/useFAQMatcher";
import ChatMessage from "@/components/chat/ChatMessage";
import ChatInput from "@/components/chat/ChatInput";
import scooterLogo from "@/assets/scooter-logo.png";

interface Message {
  id: string;
  message_type: "user" | "assistant";
  content: string;
  file_urls?: string[];
  file_names?: string[];
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const Chat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [userMobile, setUserMobile] = useState<string | null>(null);
  const [messageQuestionMap, setMessageQuestionMap] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generateResponse } = useFAQMatcher();

  useEffect(() => {
    const mobile = sessionStorage.getItem("userMobile");
    if (!mobile) {
      navigate("/login");
      return;
    }
    setUserMobile(mobile);
    loadConversations(mobile);
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async (mobile: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_mobile', mobile)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as Message[]) || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createNewConversation = async () => {
    if (!userMobile) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert([{ user_mobile: userMobile }])
        .select()
        .single();

      if (error) throw error;
      
      const newConv = data as Conversation;
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversation(newConv);
      setMessages([]);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      });
    }
  };

  const uploadFiles = async (files: File[]): Promise<{ urls: string[], names: string[] }> => {
    const urls: string[] = [];
    const names: string[] = [];

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('chat-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('chat-files')
          .getPublicUrl(fileName);

        urls.push(data.publicUrl);
        names.push(file.name);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    return { urls, names };
  };

  const sendMessage = async (content: string, files?: File[]) => {
    if (!currentConversation || !userMobile) {
      await createNewConversation();
      return;
    }

    setLoading(true);
    try {
      let fileUrls: string[] = [];
      let fileNames: string[] = [];

      // Upload files if any
      if (files && files.length > 0) {
        const uploadResult = await uploadFiles(files);
        fileUrls = uploadResult.urls;
        fileNames = uploadResult.names;
      }

      // Add user message
      const { data: userMessage, error: userError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: currentConversation.id,
          message_type: 'user',
          content,
          file_urls: fileUrls.length > 0 ? fileUrls : null,
          file_names: fileNames.length > 0 ? fileNames : null,
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Generate assistant response
      const assistantResponse = generateResponse(content);

      // Add assistant message
      const { data: assistantMessage, error: assistantError } = await supabase
        .from('chat_messages')
        .insert([{
          conversation_id: currentConversation.id,
          message_type: 'assistant',
          content: assistantResponse,
        }])
        .select()
        .single();

      if (assistantError) throw assistantError;

      // Track the question for this assistant response
      setMessageQuestionMap(prev => ({
        ...prev,
        [assistantMessage.id]: content
      }));

      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ 
          updated_at: new Date().toISOString(),
          title: content.length > 50 ? content.substring(0, 50) + '...' : content
        })
        .eq('id', currentConversation.id);

      // Reload messages
      await loadMessages(currentConversation.id);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    loadMessages(conversation.id);
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <img src={scooterLogo} alt="VoltAssist" className="w-6 h-6" />
              <span className="font-semibold bg-gradient-electric bg-clip-text text-transparent">
                Chat
              </span>
            </div>
          </div>
          <Button onClick={createNewConversation} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-muted ${
                  currentConversation?.id === conversation.id ? 'bg-muted' : ''
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conversation.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{currentConversation.title}</h2>
                <Badge variant="secondary">Electric Scooter Assistant</Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                    <p className="text-muted-foreground">
                      Ask me anything about electric scooters - battery, range, maintenance, safety, and more!
                    </p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    messageType={message.message_type}
                    content={message.content}
                    fileUrls={message.file_urls || undefined}
                    fileNames={message.file_names || undefined}
                    createdAt={message.created_at}
                    userMobile={userMobile || undefined}
                    conversationId={currentConversation?.id}
                    originalQuestion={message.message_type === 'assistant' ? messageQuestionMap[message.id] : undefined}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <ChatInput onSendMessage={sendMessage} isLoading={loading} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Welcome to VoltAssist Chat</h3>
              <p className="text-muted-foreground mb-4">
                Start a new conversation to get help with your electric scooter questions
              </p>
              <Button onClick={createNewConversation}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;