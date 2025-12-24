import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const languageNames: Record<string, string> = {
  en: 'English',
  th: 'Thai',
  lo: 'Lao',
  zh: 'Chinese',
  vi: 'Vietnamese',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { translationKey, fallbackText, category } = await req.json();

    if (!translationKey || !fallbackText) {
      return new Response(
        JSON.stringify({ error: 'Missing translationKey or fallbackText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Auto-registering translation key: ${translationKey}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if translation already exists for English
    const { data: existing } = await supabase
      .from('translations')
      .select('id')
      .eq('translation_key', translationKey)
      .eq('language_code', 'en')
      .maybeSingle();

    if (existing) {
      console.log(`Translation key ${translationKey} already exists`);
      return new Response(
        JSON.stringify({ success: true, message: 'Already exists', registered: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all active languages
    const { data: languages, error: langError } = await supabase
      .from('languages')
      .select('code')
      .eq('is_active', true);

    if (langError) throw langError;

    const activeLanguages = languages?.map(l => l.code) || ['en'];
    
    // Insert English translation first
    const { error: insertError } = await supabase
      .from('translations')
      .insert({
        translation_key: translationKey,
        language_code: 'en',
        translation_value: fallbackText,
        category: category || 'general',
      });

    if (insertError) throw insertError;
    console.log(`Inserted English translation for: ${translationKey}`);

    // Auto-translate to other languages
    const otherLanguages = activeLanguages.filter(lang => lang !== 'en');
    
    if (otherLanguages.length > 0) {
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      if (LOVABLE_API_KEY) {
        const translations: Record<string, string> = {};

        for (const targetLang of otherLanguages) {
          try {
            const targetLangName = languageNames[targetLang] || targetLang;
            
            const translationPrompt = `Translate the following text from English to ${targetLangName}. 
Return ONLY the translated text without any additional explanation, quotes, or formatting.

Text to translate: "${fallbackText}"`;

            const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${LOVABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  { role: 'system', content: 'You are a professional translator. Translate accurately and naturally.' },
                  { role: 'user', content: translationPrompt }
                ],
                temperature: 0.3,
                max_tokens: 1000,
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const translatedText = data.choices?.[0]?.message?.content?.trim();
              
              if (translatedText) {
                translations[targetLang] = translatedText;
                console.log(`Translated to ${targetLang}: ${translatedText.substring(0, 50)}...`);
              }
            } else {
              console.error(`Translation API error for ${targetLang}:`, response.status);
            }
          } catch (error) {
            console.error(`Error translating to ${targetLang}:`, error);
          }
        }

        // Insert all translations
        const translationInserts = Object.entries(translations).map(([langCode, value]) => ({
          translation_key: translationKey,
          language_code: langCode,
          translation_value: value,
          category: category || 'general',
        }));

        if (translationInserts.length > 0) {
          const { error: batchError } = await supabase
            .from('translations')
            .insert(translationInserts);

          if (batchError) {
            console.error('Error inserting translations:', batchError);
          } else {
            console.log(`Inserted ${translationInserts.length} translations for: ${translationKey}`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Translation registered and auto-translated',
        registered: true,
        key: translationKey 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in auto-register-translation:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
