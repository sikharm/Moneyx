-- Add unique constraint for translation upsert to work
ALTER TABLE public.translations 
ADD CONSTRAINT translations_key_language_unique 
UNIQUE (translation_key, language_code);