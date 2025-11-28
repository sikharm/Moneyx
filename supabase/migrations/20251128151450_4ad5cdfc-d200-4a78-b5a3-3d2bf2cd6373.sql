-- Create user_downloads table to track download history
CREATE TABLE public.user_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_id UUID NOT NULL REFERENCES public.files(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;

-- Users can only view their own downloads
CREATE POLICY "Users can view own downloads"
ON public.user_downloads FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own downloads
CREATE POLICY "Users can insert own downloads"
ON public.user_downloads FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_downloads_user_id ON public.user_downloads(user_id);
CREATE INDEX idx_user_downloads_file_id ON public.user_downloads(file_id);