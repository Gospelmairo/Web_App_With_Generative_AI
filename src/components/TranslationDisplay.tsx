
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAudioPlayback } from '@/hooks/useAudioPlayback';

interface TranslationDisplayProps {
  originalText: string;
  translatedText: string;
  originalLanguage: string;
  targetLanguage: string;
  role: 'patient' | 'provider';
}

const TranslationDisplay = ({ 
  originalText, 
  translatedText, 
  originalLanguage, 
  targetLanguage,
  role 
}: TranslationDisplayProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { playAudio } = useAudioPlayback();

  const handlePlayAudio = async (text: string, language: string) => {
    if (!text || isPlaying) return;
    
    setIsPlaying(true);
    await playAudio(text, language);
    
    // Reset playing state after a delay
    setTimeout(() => setIsPlaying(false), 1000);
  };

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

  if (!originalText && !translatedText) {
    return null;
  }

  const cardColors = {
    patient: 'bg-blue-50 border-blue-200',
    provider: 'bg-green-50 border-green-200'
  };

  return (
    <Card className={`${cardColors[role]} transition-all duration-200`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">
          Translation Result
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {originalText && (
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">
                Originalss ({getLanguageName(originalLanguage)}):
              </p>
              <p>hello</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePlayAudio(originalText, originalLanguage)}
                disabled={isPlaying}
                className="h-8 w-8 p-0"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-800">{originalText}</p>
          </div>
        )}
        
        {originalText && translatedText && <Separator />}
        
        {translatedText && (
          <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-600">
                Translationklk ({getLanguageName(targetLanguage)}):
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePlayAudio(translatedText, targetLanguage)}
                disabled={isPlaying}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-800 font-medium">{translatedText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TranslationDisplay;
