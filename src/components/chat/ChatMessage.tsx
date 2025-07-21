import { useState } from "react";
import { Bot, User, FileText, Image, ThumbsDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SupportRequestForm } from "./SupportRequestForm";

interface ChatMessageProps {
  id: string;
  messageType: "user" | "assistant";
  content: string;
  fileUrls?: string[];
  fileNames?: string[];
  createdAt: string;
  userMobile?: string;
  conversationId?: string;
  originalQuestion?: string;
}

const ChatMessage = ({ 
  id, 
  messageType, 
  content, 
  fileUrls, 
  fileNames, 
  createdAt, 
  userMobile, 
  conversationId, 
  originalQuestion 
}: ChatMessageProps) => {
  const [showSupportForm, setShowSupportForm] = useState(false);
  const isUser = messageType === "user";
  
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <Card className={`max-w-[80%] p-4 ${
        isUser ? 'bg-primary text-primary-foreground' : 'bg-card'
      }`}>
        <div className="space-y-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          
          {fileUrls && fileUrls.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/20">
              {fileUrls.map((url, index) => {
                const fileName = fileNames?.[index] || `file-${index + 1}`;
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
                  fileName.split('.').pop()?.toLowerCase() || ''
                );
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getFileIcon(fileName)}
                      <Badge variant="secondary" className="text-xs">
                        {fileName}
                      </Badge>
                    </div>
                    
                    {isImage && (
                      <img 
                        src={url} 
                        alt={fileName}
                        className="max-w-full h-auto rounded-md border"
                        style={{ maxHeight: '200px' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          <div className={`flex items-center justify-between ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            <p className={`text-xs opacity-70`}>
              {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            
            {!isUser && userMobile && conversationId && originalQuestion && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSupportForm(true)}
                className="opacity-70 hover:opacity-100 h-6 px-2 text-xs"
              >
                <ThumbsDown className="w-3 h-3 mr-1" />
                Not helpful?
              </Button>
            )}
          </div>
        </div>
      </Card>
      
      {!isUser && showSupportForm && userMobile && conversationId && originalQuestion && (
        <SupportRequestForm
          isOpen={showSupportForm}
          onClose={() => setShowSupportForm(false)}
          userMobile={userMobile}
          conversationId={conversationId}
          messageId={id}
          originalQuestion={originalQuestion}
          chatbotResponse={content}
        />
      )}
    </div>
  );
};

export default ChatMessage;