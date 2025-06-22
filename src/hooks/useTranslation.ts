
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TranslationHook {
  translate: (text: string, from: string, to: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

// Simple fallback translations for common medical phrases
const fallbackTranslations: { [key: string]: { [key: string]: string } } = {
  'en-es': {
    'hello doctor I need a medicine': 'hola doctor necesito una medicina',
    'hello doctor I need the medicine': 'hola doctor necesito la medicina',
    'hello doctor I need': 'hola doctor necesito',
    'hello doctor': 'hola doctor',
    'I need help': 'necesito ayuda',
    'I am in pain': 'tengo dolor',
    'where does it hurt': '¿dónde te duele?',
    'how long': '¿cuánto tiempo?',
    'thank you': 'gracias',
    'please help me': 'por favor ayúdame',
    'I feel sick': 'me siento enfermo',
    'I have a headache': 'tengo dolor de cabeza',
    'I need water': 'necesito agua',
    'call a doctor': 'llama a un doctor',
    'emergency': 'emergencia'
  }
};

export const useTranslation = (): TranslationHook => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(async (text: string, from: string, to: string): Promise<string> => {
    if (from === to) {
      return text;
    }

    setIsLoading(true);
    setError(null);

    // Check for fallback translation first
    const translationKey = `${from}-${to}`;
    const fallbackDict = fallbackTranslations[translationKey];
    const fallbackTranslation = fallbackDict?.[text.toLowerCase()];

    try {
      const { data, error: functionError } = await supabase.functions.invoke('translate-text', {
        body: {
          text,
          fromLanguage: from,
          toLanguage: to
        }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        // Use fallback if available, otherwise return original
        const result = fallbackTranslation || text;
        setIsLoading(false);
        return result;
      }

      if (data?.error) {
        console.error('API error:', data.error);
        // Use fallback if available, otherwise return original
        const result = fallbackTranslation || text;
        setIsLoading(false);
        return result;
      }

      const translatedText = data?.translatedText || fallbackTranslation || text;
      setIsLoading(false);
      return translatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      console.error('Translation error:', errorMessage);
      
      // Use fallback translation if available
      const result = fallbackTranslation || text;
      setError(`Translation service unavailable. Using ${fallbackTranslation ? 'basic translation' : 'original text'}.`);
      setIsLoading(false);
      return result;
    }
  }, []);

  return { translate, isLoading, error };
};
