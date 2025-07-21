-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-files', 'chat-files', true);

-- Create policies for chat files bucket
CREATE POLICY "Users can view all chat files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'chat-files');

CREATE POLICY "Users can upload chat files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'chat-files');

CREATE POLICY "Users can update their own chat files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'chat-files');

CREATE POLICY "Users can delete their own chat files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'chat-files');

-- Create FAQs table
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  keywords TEXT[], -- For better matching
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_mobile TEXT NOT NULL,
  title TEXT DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'assistant')),
  content TEXT NOT NULL,
  file_urls TEXT[], -- Array of file URLs if any files attached
  file_names TEXT[], -- Original file names
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for FAQs (public read)
CREATE POLICY "Anyone can view FAQs" 
ON public.faqs 
FOR SELECT 
USING (true);

-- Create policies for chat conversations
CREATE POLICY "Users can view their own conversations" 
ON public.chat_conversations 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own conversations" 
ON public.chat_conversations 
FOR UPDATE 
USING (true);

-- Create policies for chat messages
CREATE POLICY "Users can view messages in their conversations" 
ON public.chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

-- Create triggers for timestamp updates
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category, keywords) VALUES
('What is the range of an electric scooter?', 'Most electric scooters have a range between 15-40 km on a single charge, depending on the battery capacity, rider weight, terrain, and riding mode. Premium scooters can achieve ranges up to 60+ km.', 'battery', ARRAY['range', 'distance', 'battery', 'charge', 'km', 'mileage']),
('How long does it take to charge an electric scooter?', 'Charging time typically ranges from 3-8 hours for a full charge. Fast charging models can charge up to 80% in 2-4 hours. Always use the original charger provided by the manufacturer.', 'battery', ARRAY['charging', 'charge', 'time', 'hours', 'battery', 'charger']),
('What is the maximum speed of electric scooters?', 'Electric scooters typically have a top speed of 25-45 km/h. Speed varies based on motor power, battery level, rider weight, and local regulations. Some high-performance models can reach 60+ km/h.', 'performance', ARRAY['speed', 'fast', 'km/h', 'motor', 'performance', 'top speed']),
('Are electric scooters waterproof?', 'Most electric scooters have IPX4 or IPX5 water resistance, meaning they can handle light rain and splashes but should not be submerged. Avoid riding in heavy rain or through deep puddles.', 'maintenance', ARRAY['waterproof', 'rain', 'water', 'wet', 'weather', 'IP rating']),
('How much weight can an electric scooter carry?', 'Most electric scooters can carry 100-120 kg. Heavy-duty models can support up to 150 kg. Check the manufacturer specifications for your specific model to ensure safe operation.', 'specifications', ARRAY['weight', 'load', 'capacity', 'carry', 'kg', 'heavy', 'limit']),
('Do I need a license to ride an electric scooter?', 'In India, electric scooters under 25 km/h typically do not require a license or registration. However, regulations vary by state and are subject to change. Check your local RTO guidelines.', 'legal', ARRAY['license', 'registration', 'legal', 'permit', 'RTO', 'law', 'India']),
('How do I maintain my electric scooter?', 'Regular maintenance includes: checking tire pressure, cleaning the scooter, checking brakes, keeping battery charged between 20-80%, storing in dry place, and periodic professional servicing.', 'maintenance', ARRAY['maintenance', 'care', 'service', 'clean', 'tire', 'brake', 'battery']),
('What should I do if my scooter is not starting?', 'First check if the battery is charged, ensure the scooter is unlocked, check if the kickstand is up, verify the power button is pressed properly. If issues persist, contact customer support.', 'troubleshooting', ARRAY['not starting', 'problem', 'issue', 'battery', 'power', 'kickstand', 'unlock']),
('How much does it cost to run an electric scooter?', 'Electric scooters are very economical to run. Charging costs around ₹2-8 per full charge, giving you 20-40 km range. This works out to less than ₹1 per km, much cheaper than petrol vehicles.', 'cost', ARRAY['cost', 'cheap', 'economical', 'charging cost', 'rupees', 'price', 'running cost']),
('What safety gear should I use while riding?', 'Always wear a helmet (mandatory in most areas). Additional recommended gear includes knee pads, elbow pads, reflective clothing, and proper footwear. Ensure your scooter has working lights for night riding.', 'safety', ARRAY['safety', 'helmet', 'gear', 'protection', 'knee pads', 'lights', 'reflective']);