
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, fromLanguage, toLanguage } = await req.json()
    
    if (!text || !fromLanguage || !toLanguage) {
      throw new Error('Missing required parameters: text, fromLanguage, toLanguage')
    }

    // If same language, return original text
    if (fromLanguage === toLanguage) {
      return new Response(
        JSON.stringify({ translatedText: text }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const languageNames = {
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
      'hi': 'Hindi'
    }

    const fromLangName = languageNames[fromLanguage] || fromLanguage
    const toLangName = languageNames[toLanguage] || toLanguage

    console.log(`Translating from ${fromLangName} to ${toLangName}:`, text)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional medical translator. Translate the following text from ${fromLangName} to ${toLangName}. Focus on accuracy and maintain medical terminology. Only return the translation, no explanations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 1000
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const result = await response.json()
    const translatedText = result.choices?.[0]?.message?.content?.trim() || text

    console.log('Translation successful:', translatedText)

    return new Response(
      JSON.stringify({ translatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Translation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
