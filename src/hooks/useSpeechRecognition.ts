
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface UseSpeechRecognitionProps {
  language: string;
  targetLanguage: string;
  onTranscript: (text: string) => void;
  onTranslation?: (translation: string) => void;
}

export const useSpeechRecognition = ({
  language,
  targetLanguage,
  onTranscript,
  onTranslation
}: UseSpeechRecognitionProps) => {
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isManualStopRef = useRef(false);
  const shouldRestartRef = useRef(false);
  const { translate, isLoading: isTranslating } = useTranslation();

  const getLanguageCode = useCallback((lang: string) => {
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
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log('Force stopping speech recognition');
      isManualStopRef.current = true;
      shouldRestartRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass() as SpeechRecognition;
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLanguageCode(language);

    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
      isManualStopRef.current = false;
    };

    recognition.onresult = async (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      
      if (currentTranscript.trim() && language !== targetLanguage) {
        try {
          const translatedText = await translate(currentTranscript, language, targetLanguage);
          setTranslation(translatedText);
          if (onTranslation) {
            onTranslation(translatedText);
          }
        } catch (error) {
          console.error('Real-time translation error:', error);
        }
      } else if (language === targetLanguage) {
        setTranslation(currentTranscript);
        if (onTranslation) {
          onTranslation(currentTranscript);
        }
      }
      
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        shouldRestartRef.current = false;
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
      
      // Only restart if explicitly requested and not manually stopped
      if (shouldRestartRef.current && !isManualStopRef.current) {
        console.log('Auto-restarting speech recognition as requested');
        try {
          recognition.start();
        } catch (error) {
          console.error('Failed to restart recognition:', error);
          shouldRestartRef.current = false;
        }
      } else {
        shouldRestartRef.current = false;
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        isManualStopRef.current = true;
        shouldRestartRef.current = false;
        recognitionRef.current.stop();
      }
    };
  }, [language, targetLanguage, onTranscript, onTranslation, translate, getLanguageCode]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      console.log('Manually stopping speech recognition');
      isManualStopRef.current = true;
      shouldRestartRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      
      // Clear current transcript and translation
      setTranscript('');
      setTranslation('');
    } else {
      console.log('Starting speech recognition');
      isManualStopRef.current = false;
      shouldRestartRef.current = true;
      // Update language before starting
      recognitionRef.current.lang = getLanguageCode(language);
      recognitionRef.current.start();
    }
  }, [isListening, language, getLanguageCode]);

  return {
    transcript,
    translation,
    isListening,
    isTranslating,
    toggleListening,
    stopRecording
  };
};
