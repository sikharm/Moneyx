import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const languageNames: Record<string, string> = {
  en: 'English',
  lo: 'Lao',
  th: 'Thai',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, sourceLanguage, targetLanguages } = await req.json();
    
    if (!text || !sourceLanguage || !targetLanguages?.length) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: text, sourceLanguage, targetLanguages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Translation service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const translations: Record<string, string> = {};
    
    for (const targetLang of targetLanguages) {
      if (targetLang === sourceLanguage) {
        translations[targetLang] = text;
        continue;
      }

      const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
      const targetLangName = languageNames[targetLang] || targetLang;

      const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. 
Only return the translated text, nothing else. Do not add quotes or explanations.
If the text contains technical terms or proper nouns, keep them as-is or transliterate appropriately.

Text to translate: "${text}"`;

      console.log(`Translating to ${targetLang}:`, text.substring(0, 50));

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { 
              role: 'system', 
              content: 'You are a professional translator. Translate accurately while preserving meaning and tone. Only output the translation, nothing else.' 
            },
            { role: 'user', content: prompt }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          console.error('Rate limit exceeded');
          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          console.error('Payment required');
          return new Response(
            JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        throw new Error(`Translation failed for ${targetLang}`);
      }

      const data = await response.json();
      const translatedText = data.choices?.[0]?.message?.content?.trim();
      
      if (translatedText) {
        translations[targetLang] = translatedText;
        console.log(`Translated to ${targetLang}:`, translatedText.substring(0, 50));
      } else {
        console.error(`No translation returned for ${targetLang}`);
        translations[targetLang] = text; // Fallback to original
      }
    }

    return new Response(
      JSON.stringify({ translations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Translation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
