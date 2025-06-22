import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2 } from "lucide-react";
import { useAudioPlayback } from '@/hooks/useAudioPlayback';

interface EmergencyPhrasesProps {
  targetLanguage: string;
  onPhraseSelect: (phrase: string, translation: string) => void;
}

const EmergencyPhrases = ({ targetLanguage, onPhraseSelect }: EmergencyPhrasesProps) => {
  const { playAudio } = useAudioPlayback();

  const emergencyPhrases = [
    {
      english: "Are you in pain?",
      translations: {
        es: "¿Tienes dolor?",
        fr: "Avez-vous mal?",
        de: "Haben Sie Schmerzen?",
        it: "Hai dolore?",
        pt: "Você está com dor?",
        ru: "У вас болит?",
        zh: "你疼吗?",
        ja: "痛みはありますか？",
        ko: "아프세요?",
        ar: "هل تشعر بألم؟",
        hi: "क्या आपको दर्द है?"
      }
    },
    {
      english: "Can you breathe normally?",
      translations: {
        es: "¿Puedes respirar normalmente?",
        fr: "Pouvez-vous respirer normalement?",
        de: "Können Sie normal atmen?",
        it: "Riesci a respirare normalmente?",
        pt: "Você consegue respirar normalmente?",
        ru: "Вы можете нормально дышать?",
        zh: "你能正常呼吸吗?",
        ja: "正常に呼吸できますか？",
        ko: "정상적으로 숨을 쉴 수 있나요?",
        ar: "هل يمكنك التنفس بشكل طبيعي؟",
        hi: "क्या आप सामान्य रूप से सांस ले सकते हैं?"
      }
    },
    {
      english: "How long have you had these symptoms?",
      translations: {
        es: "¿Cuánto tiempo has tenido estos síntomas?",
        fr: "Depuis combien de temps avez-vous ces symptômes?",
        de: "Wie lange haben Sie diese Symptome schon?",
        it: "Da quanto tempo hai questi sintomi?",
        pt: "Há quanto tempo você tem esses sintomas?",
        ru: "Как долго у вас эти симптомы?",
        zh: "你有这些症状多长时间了?",
        ja: "これらの症状はどのくらい続いていますか？",
        ko: "이런 증상이 얼마나 오래 지속되었나요?",
        ar: "منذ متى وأنت تعاني من هذه الأعراض؟",
        hi: "आपको ये लक्षण कब से हैं?"
      }
    },
    {
      english: "Please take this medication",
      translations: {
        es: "Por favor toma este medicamento",
        fr: "Veuillez prendre ce médicament",
        de: "Bitte nehmen Sie dieses Medikament",
        it: "Per favore prendi questo farmaco",
        pt: "Por favor, tome este medicamento",
        ru: "Пожалуйста, принимайте это лекарство",
        zh: "请服用这个药",
        ja: "この薬を服用してください",
        ko: "이 약을 복용해 주세요",
        ar: "يرجى تناول هذا الدواء",
        hi: "कृपया यह दवा लें"
      }
    },
    {
      english: "I need to examine you",
      translations: {
        es: "Necesito examinarte",
        fr: "Je dois vous examiner",
        de: "Ich muss Sie untersuchen",
        it: "Devo esaminarti",
        pt: "Preciso examiná-lo",
        ru: "Мне нужно вас осмотреть",
        zh: "我需要检查你",
        ja: "検査が必要です",
        ko: "검사가 필요합니다",
        ar: "أحتاج إلى فحصك",
        hi: "मुझे आपकी जांच करनी होगी"
      }
    }
  ];

  return (
    <Card className="bg-red-50 border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-red-700">
          Quick Emergency Phrases
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {emergencyPhrases.map((phrase, index) => {
            const translation = phrase.translations[targetLanguage as keyof typeof phrase.translations] || phrase.english;
            
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-red-50 transition-colors cursor-pointer"
                onClick={() => onPhraseSelect(phrase.english, translation)}
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{phrase.english}</p>
                  {translation !== phrase.english && (
                    <p className="text-sm text-red-600 font-medium">{translation}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(translation, targetLanguage);
                  }}
                  className="ml-2 h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyPhrases;
