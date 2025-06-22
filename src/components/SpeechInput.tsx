
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import RecordingStatus from './speech/RecordingStatus';
import TranscriptDisplay from './speech/TranscriptDisplay';
import RecordingHistory from './speech/RecordingHistory';
import { toast } from "@/hooks/use-toast";

interface SpeechInputProps {
  language: string;
  targetLanguage: string;
  onTranscript: (text: string) => void;
  onTranslation?: (translation: string) => void;
}

interface RecordingEntry {
  id: string;
  transcript: string;
  translation: string;
  timestamp: Date;
  originalLanguage: string;
  targetLanguage: string;
}

const SpeechInput = ({ language, targetLanguage, onTranscript, onTranslation }: SpeechInputProps) => {
  const [recordingHistory, setRecordingHistory] = useState<RecordingEntry[]>([]);

  const handleTranscript = useCallback((text: string) => {
    onTranscript(text);
  }, [onTranscript]);

  const handleTranslation = useCallback((translation: string) => {
    if (onTranslation) {
      onTranslation(translation);
    }
  }, [onTranslation]);

  const {
    transcript,
    translation,
    isListening,
    isTranslating,
    toggleListening,
    stopRecording
  } = useSpeechRecognition({
    language,
    targetLanguage,
    onTranscript: handleTranscript,
    onTranslation: handleTranslation
  });

  const handleToggleListening = useCallback(() => {
    if (isListening) {
      // Stopping - save current transcript to history if it exists
      if (transcript.trim()) {
        const entry: RecordingEntry = {
          id: `entry-${Date.now()}`,
          transcript: transcript.trim(),
          translation: translation.trim(),
          timestamp: new Date(),
          originalLanguage: language,
          targetLanguage: targetLanguage
        };
        setRecordingHistory([entry]);
      }
      // Ensure all recording is stopped and resources are released
      if (typeof stopRecording === 'function') {
        stopRecording();
      }
    } else {
      // Starting - clear history for new recording session
      setRecordingHistory([]);
    }
    toggleListening();
  }, [isListening, transcript, translation, language, targetLanguage, toggleListening, stopRecording]);

  const handleClearHistory = useCallback(() => {
    setRecordingHistory([]);
    toast({
      title: "History Cleared",
      description: "Recording history has been cleared.",
    });
  }, []);

  const handlePlayAudio = useCallback((text: string, lang: string) => {
    console.log('Playing audio:', text, 'in language:', lang);
    
    // Ensure speech recognition is paused during audio playback
    const wasListening = isListening;
    if (wasListening && stopRecording) {
      stopRecording();
    }

    // Cancel any ongoing speech synthesis
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getLanguageCode(lang);
    utterance.rate = 0.9;
    utterance.volume = 1.0;
    
    utterance.onstart = () => {
      console.log('Audio playback started');
    };
    
    utterance.onend = () => {
      console.log('Audio playback ended');
      // Resume recording after audio playback ends if it was previously listening
      if (wasListening && toggleListening) {
        // Wait a brief moment before restarting to ensure clean transition
        setTimeout(() => {
          toggleListening();
        }, 500);
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      toast({
        title: "Audio Error",
        description: "Failed to play audio. Please try again.",
        variant: "destructive",
      });
    };
    
    speechSynthesis.speak(utterance);
    
    toast({
      title: "Playing Audio",
      description: `Playing "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
    });
  }, [isListening, stopRecording, toggleListening]);

  const handleCopyText = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Text copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy text:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy text to clipboard.",
        variant: "destructive",
      });
    }
  }, []);

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

  return (
    <div className="space-y-4">
      <Card className="bg-blue-50 border-blue-200 transition-all duration-200">
        <CardHeader className="pb-3">
          <RecordingStatus isListening={isListening} onToggle={handleToggleListening} />
        </CardHeader>
        <CardContent className="space-y-4">
          <TranscriptDisplay
            transcript={transcript}
            translation={translation}
            language={language}
            targetLanguage={targetLanguage}
            isTranslating={isTranslating}
          />
        </CardContent>
      </Card>

      <RecordingHistory
        entries={recordingHistory}
        onClear={handleClearHistory}
        onPlayAudio={handlePlayAudio}
        onCopyText={handleCopyText}
      />
    </div>
  );
};

export default SpeechInput;
