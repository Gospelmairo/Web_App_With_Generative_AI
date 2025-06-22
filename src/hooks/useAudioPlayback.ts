
import { useCallback } from 'react';

export const useAudioPlayback = () => {
  const playAudio = useCallback(async (text: string, language: string) => {
    if (!text) return;
    
    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getLanguageCode(language);
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
      const voice = voices.find(v => v.lang.startsWith(language)) || voices[0];
      if (voice) {
        utterance.voice = voice;
      }
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error playing audio:', error);
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

  return { playAudio };
};
