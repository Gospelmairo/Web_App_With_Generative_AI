
-- Create messages table for storing chat messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  translated_content TEXT,
  sender_id UUID REFERENCES auth.users NOT NULL,
  recipient_id UUID REFERENCES auth.users NOT NULL,
  conversation_id UUID NOT NULL,
  original_language TEXT,
  target_language TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversations table to group messages
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users NOT NULL,
  provider_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, provider_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Users can view messages in their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can insert messages in their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE id = conversation_id 
      AND (patient_id = auth.uid() OR provider_id = auth.uid())
    )
  );

-- RLS policies for conversations
CREATE POLICY "Users can view their conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (
    auth.uid() = patient_id OR 
    auth.uid() = provider_id
  );

CREATE POLICY "Users can create conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = patient_id OR 
    auth.uid() = provider_id
  );

-- Enable real-time for messages
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create indexes for better performance
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_conversations_participants ON public.conversations(patient_id, provider_id);
