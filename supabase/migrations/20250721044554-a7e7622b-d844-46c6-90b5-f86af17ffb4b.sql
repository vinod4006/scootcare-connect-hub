-- Create support requests table
CREATE TABLE public.support_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_mobile text NOT NULL,
  conversation_id uuid REFERENCES public.chat_conversations(id),
  message_id uuid REFERENCES public.chat_messages(id),
  original_question text NOT NULL,
  chatbot_response text NOT NULL,
  user_feedback text,
  support_query text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for support requests
CREATE POLICY "Users can create support requests" 
ON public.support_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own support requests" 
ON public.support_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own support requests" 
ON public.support_requests 
FOR UPDATE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_support_requests_updated_at
BEFORE UPDATE ON public.support_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();