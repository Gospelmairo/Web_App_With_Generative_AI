
import React from 'react';
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TranscriptDisplayProps {
  transcript: string;
  translation: string;
  language: string;
  targetLanguage: string;
  isTranslating: boolean;
}

const TranscriptDisplay = ({ 
  transcript, 
  translation, 
  language, 
  targetLanguage, 
  isTranslating 
}: TranscriptDisplayProps) => {
  const getLanguageName = (code: string) => {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ar': 'Arabic',
      'hi': 'Hindi',
    };
    return languageNames[code] || code;
  };

  const getLanguageCode = (lang: string) => {
    const languageMap: { [key: string]: string } = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
    };
    return languageMap[lang] || 'en-US';
  };

  const handlePlayAudio = async (text: string, lang: string) => {
    if (!text.trim()) return;
    
    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(lang);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Wait for voices to be loaded
      if (speechSynthesis.getVoices().length === 0) {
        await new Promise((resolve) => {
          speechSynthesis.addEventListener('voiceschanged', resolve, { once: true });
        });
      }
      
      // Try to find a voice for the language
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(lang)) || voices[0];
      if (voice) {
        utterance.voice = voice;
      }
      
      speechSynthesis.speak(utterance);
      
      toast({
        title: "Playing Audio",
        description: `Playing "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Audio Error",
        description: "Failed to play audio.",
        variant: "destructive",
      });
    }
  };

  if (!transcript) return null;

  return (
    <div className="space-y-3">
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">
            Original ({getLanguageName(language)}):
          </p>
          {transcript.trim() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePlayAudio(transcript, language)}
              className="h-6 w-6 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              title="Play original audio"
            >
              <Volume2 className="h-3 w-3" />
            </Button>
          )}
        </div>
        <p className="text-gray-800">{transcript}</p>
      </div>
      
      {language !== targetLanguage && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-sm text-blue-600">
                Translation ({getLanguageName(targetLanguage)}):
              </p>
              {isTranslating && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              )}
            </div>
            {translation.trim() && !isTranslating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePlayAudio(translation, targetLanguage)}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                title="Play translation audio"
              >
                <Volume2 className="h-3 w-3" />
              </Button>
            )}
          </div>
          <p className="text-gray-800 font-medium">
            {isTranslating ? "Translating..." : translation}
          </p>
        </div>
      )}
    </div>
  );
};

export default TranscriptDisplay;
