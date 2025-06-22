
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface ConversationEntry {
  id: string;
  originalText: string;
  translatedText: string;
  originalLanguage: string;
  targetLanguage: string;
  role: 'patient' | 'provider';
  timestamp: Date;
}

interface ConversationHistoryProps {
  entries: ConversationEntry[];
  onClear: () => void;
}

const ConversationHistory = ({ entries, onClear }: ConversationHistoryProps) => {
  const playAudio = (text: string, language: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(language);
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Translation History
          </CardTitle>
          {entries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No translation history yet. Start speaking to see translations here.
          </p>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-lg border bg-white border-blue-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500">
                        {entry.role === 'patient' ? 'Patient' : 'Emergency Phrase'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Original:</p>
                        <p className="text-gray-800">{entry.originalText}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(entry.originalText, entry.originalLanguage)}
                        className="ml-2 h-8 w-8 p-0"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-start justify-between bg-blue-50 p-3 rounded">
                      <div className="flex-1">
                        <p className="text-sm text-blue-600 mb-1">Translation:</p>
                        <p className="text-gray-800 font-medium">{entry.translatedText}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => playAudio(entry.translatedText, entry.targetLanguage)}
                        className="ml-2 h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationHistory;
