import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SupportRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  userMobile: string;
  conversationId: string;
  messageId: string;
  originalQuestion: string;
  chatbotResponse: string;
}

export const SupportRequestForm = ({
  isOpen,
  onClose,
  userMobile,
  conversationId,
  messageId,
  originalQuestion,
  chatbotResponse,
}: SupportRequestFormProps) => {
  const [feedback, setFeedback] = useState("");
  const [supportQuery, setSupportQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supportQuery.trim()) {
      toast({
        title: "Required Field",
        description: "Please describe your issue or question",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('support_requests')
        .insert({
          user_mobile: userMobile,
          conversation_id: conversationId,
          message_id: messageId,
          original_question: originalQuestion,
          chatbot_response: chatbotResponse,
          user_feedback: feedback.trim() || null,
          support_query: supportQuery.trim(),
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your support request has been submitted successfully. Our team will review it and get back to you soon.",
      });

      // Reset form and close
      setFeedback("");
      setSupportQuery("");
      onClose();
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your support request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Contact Human Support
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Original Question:</Label>
            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
              {originalQuestion}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Chatbot Response:</Label>
            <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground max-h-32 overflow-y-auto">
              {chatbotResponse}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-medium">
              What was wrong with this response? (Optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="e.g., The answer was not relevant to my question about battery life..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportQuery" className="text-sm font-medium">
              Describe your issue or question *
            </Label>
            <Textarea
              id="supportQuery"
              placeholder="Please provide details about your electric scooter question or issue..."
              value={supportQuery}
              onChange={(e) => setSupportQuery(e.target.value)}
              className="min-h-24"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};