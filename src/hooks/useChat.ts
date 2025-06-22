
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  translated_content?: string;
  sender_id: string;
  recipient_id: string;
  conversation_id: string;
  original_language?: string;
  target_language?: string;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  patient_id: string;
  provider_id: string;
  created_at: string;
  updated_at: string;
}

interface UseChatProps {
  currentUserId: string;
  recipientId: string;
  userLanguage: string;
  targetLanguage: string;
}

export const useChat = ({ currentUserId, recipientId, userLanguage, targetLanguage }: UseChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { translate } = useTranslation();

  // Get or create conversation
  const getOrCreateConversation = useCallback(async () => {
    try {
      // First try to find existing conversation
      const { data: existingConversation, error: findError } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(patient_id.eq.${currentUserId},provider_id.eq.${recipientId}),and(patient_id.eq.${recipientId},provider_id.eq.${currentUserId})`)
        .maybeSingle();

      if (existingConversation && !findError) {
        setConversation(existingConversation);
        return existingConversation;
      }

      // Create new conversation if none exists
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          patient_id: currentUserId,
          provider_id: recipientId
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        toast({
          title: "Error",
          description: "Failed to create conversation.",
          variant: "destructive",
        });
        return null;
      }

      setConversation(newConversation);
      return newConversation;
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      return null;
    }
  }, [currentUserId, recipientId]);

  // Load messages for conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Failed to load messages.",
          variant: "destructive",
        });
        return;
      }

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error in loadMessages:', error);
    }
  }, []);

  // Initialize chat
  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);
      const conv = await getOrCreateConversation();
      if (conv) {
        await loadMessages(conv.id);
      }
      setLoading(false);
    };

    if (currentUserId && recipientId) {
      initializeChat();
    }
  }, [currentUserId, recipientId, getOrCreateConversation, loadMessages]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!conversation?.id) return;

    console.log('Setting up real-time subscription for conversation:', conversation.id);

    const channel = supabase
      .channel(`messages_${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          console.log('New message received via real-time:', payload.new);
          const newMessage = payload.new as ChatMessage;
          
          // Add the new message to the current messages
          setMessages(prev => {
            // Check if message already exists to avoid duplicates
            const messageExists = prev.some(msg => msg.id === newMessage.id);
            if (messageExists) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [conversation?.id]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!conversation || !content.trim()) return false;

    setSending(true);
    try {
      // Translate message if needed
      let translatedContent = '';
      if (userLanguage !== targetLanguage) {
        try {
          translatedContent = await translate(content, userLanguage, targetLanguage);
        } catch (error) {
          console.error('Translation error:', error);
          // Continue without translation
        }
      }

      const messageData = {
        content,
        translated_content: translatedContent || null,
        sender_id: currentUserId,
        recipient_id: recipientId,
        conversation_id: conversation.id,
        original_language: userLanguage,
        target_language: targetLanguage
      };

      console.log('Sending message:', messageData);

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: "Error",
          description: "Failed to send message.",
          variant: "destructive",
        });
        return false;
      }

      console.log('Message sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  }, [conversation, currentUserId, recipientId, userLanguage, targetLanguage, translate]);

  return {
    messages,
    conversation,
    loading,
    sending,
    sendMessage
  };
};
