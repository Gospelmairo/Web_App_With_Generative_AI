import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';
import { Send, ArrowLeft, Volume2, Mic } from 'lucide-react';
import LanguageSelector from '@/components/LanguageSelector';
import SpeechInput from '@/components/SpeechInput';
import { useAudioPlayback } from '@/hooks/useAudioPlayback';
import { useChat } from '@/hooks/useChat';

const Chat = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [userLanguage, setUserLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [showSpeechInput, setShowSpeechInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { providerId } = useParams();
  const location = useLocation();
  
  const providerName = location.state?.providerName || 'Healthcare Provider';
  const providerEmail = location.state?.providerEmail || '';
  
  const { playAudio } = useAudioPlayback();

  // Use the chat hook for real-time messaging
  const {
    messages,
    conversation,
    loading: chatLoading,
    sending,
    sendMessage
  } = useChat({
    currentUserId: user?.id || '',
    recipientId: providerId || '',
    userLanguage,
    targetLanguage
  });

  const fetchCurrentUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setCurrentUserProfile(data);
    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // Check authentication
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      await fetchCurrentUserProfile(session.user.id);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      if (session.user) {
        fetchCurrentUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSpeechTranslation = (translation: string) => {
    if (translation.trim() && userLanguage !== targetLanguage) {
      // Pre-fill the input with the translation
      setNewMessage(translation);
      
      toast({
        title: "Translation Ready",
        description: "Translation has been added to your message.",
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !user) return;

    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage('');
      toast({
        title: "Message Sent",
        description: "Your message has been sent.",
      });
    }
  };

  const handlePlayAudio = async (text: string, language: string) => {
    try {
      await playAudio(text, language);
    } catch (error) {
      console.error('Audio playback error:', error);
      toast({
        title: "Audio Error",
        description: "Failed to play audio.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    }
  };

  const getMessageSenderName = (message: any) => {
    if (message.sender_id === user?.id) {
      return 'You';
    }
    return providerName;
  };

  const isCurrentUserMessage = (message: any) => {
    return message.sender_id === user?.id;
  };

  if (loading || chatLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Providers
            </Button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
          
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {providerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{providerName}</CardTitle>
                  <p className="text-sm text-gray-600">{providerEmail}</p>
                </div>
                <Badge className="ml-auto bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Language Settings */}
        <Card className="mb-6 bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🌐 Language Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <LanguageSelector
                value={userLanguage}
                onChange={setUserLanguage}
                label="Your Language"
              />
              <LanguageSelector
                value={targetLanguage}
                onChange={setTargetLanguage}
                label="Translation Language"
              />
            </div>
          </CardContent>
        </Card>

        {/* Speech Input Section */}
        {showSpeechInput && (
          <Card className="mb-6 bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SpeechInput
                language={userLanguage}
                targetLanguage={targetLanguage}
                onTranslation={handleSpeechTranslation}
              />
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSpeechInput(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        <Card className="bg-white shadow-lg h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💬 Live Chat Session
              {conversation && (
                <Badge variant="outline" className="text-xs">
                  ID: {conversation.id.slice(0, 8)}...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          {/* Messages Area */}
          <CardContent className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-4 pr-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Start a conversation with {providerName}</p>
                    <p className="text-sm mt-2">Your messages will be saved and synced in real-time</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className="space-y-2">
                      <div className={`flex ${isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isCurrentUserMessage(message)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">{message.content}</p>
                            <div className="flex items-center gap-1 ml-2">
                              {message.original_language && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePlayAudio(message.content, message.original_language!)}
                                  className="h-6 w-6 p-0 hover:bg-blue-500/20"
                                  title="Play audio"
                                >
                                  <Volume2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {message.translated_content && (
                            <div className={`mt-2 pt-2 border-t ${
                              isCurrentUserMessage(message)
                                ? 'border-blue-300'
                                : 'border-gray-300'
                            }`}>
                              <div className="flex items-center justify-between">
                                <p className={`text-xs italic ${
                                  isCurrentUserMessage(message)
                                    ? 'text-blue-100'
                                    : 'text-gray-600'
                                }`}>
                                  {message.translated_content}
                                </p>
                                <div className="flex items-center gap-1 ml-2">
                                  {message.target_language && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handlePlayAudio(message.translated_content!, message.target_language!)}
                                      className="h-6 w-6 p-0 hover:bg-blue-500/20"
                                      title="Play translation audio"
                                    >
                                      <Volume2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <p className={`text-xs mt-1 ${
                            isCurrentUserMessage(message) ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {getMessageSenderName(message)} • {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message in any language..."
                    disabled={sending}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSpeechInput(!showSpeechInput)}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${
                      showSpeechInput ? 'text-blue-600' : 'text-gray-500'
                    } hover:text-blue-600`}
                    title="Voice input"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {sending ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 py-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            🔒 Secure Communication • 🎤 Voice Input • 🔊 Audio Playback • 💾 Live Database
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
