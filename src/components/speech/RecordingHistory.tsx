
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Copy, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecordingEntry {
  id: string;
  transcript: string;
  translation: string;
  timestamp: Date;
  originalLanguage: string;
  targetLanguage: string;
}

interface RecordingHistoryProps {
  entries: RecordingEntry[];
  onClear: () => void;
  onPlayAudio: (text: string, language: string) => void;
  onCopyText: (text: string) => void;
}

const RecordingHistory = ({ 
  entries, 
  onClear, 
  onPlayAudio, 
  onCopyText 
}: RecordingHistoryProps) => {
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gray-50 border-gray-200 mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Recording History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg border bg-white border-blue-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 font-medium">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {/* Original Text */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        Original ({getLanguageName(entry.originalLanguage)}):
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPlayAudio(entry.transcript, entry.originalLanguage)}
                          className="h-8 w-8 p-0 bg-white hover:bg-blue-50 border-blue-200"
                          title="Play original audio"
                        >
                          <Volume2 className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCopyText(entry.transcript)}
                          className="h-8 w-8 p-0 bg-white hover:bg-gray-50"
                          title="Copy original text"
                        >
                          <Copy className="h-4 w-4 text-gray-600" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-800 text-sm leading-relaxed">{entry.transcript}</p>
                  </div>
                  
                  {/* Translation */}
                  {entry.translation && entry.originalLanguage !== entry.targetLanguage && (
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-blue-700">
                          Translation ({getLanguageName(entry.targetLanguage)}):
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPlayAudio(entry.translation, entry.targetLanguage)}
                            className="h-8 w-8 p-0 bg-white hover:bg-blue-100 border-blue-300"
                            title="Play translation audio"
                          >
                            <Volume2 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCopyText(entry.translation)}
                            className="h-8 w-8 p-0 bg-white hover:bg-blue-100 border-blue-300"
                            title="Copy translation text"
                          >
                            <Copy className="h-4 w-4 text-blue-600" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-800 font-medium text-sm leading-relaxed">{entry.translation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecordingHistory;
