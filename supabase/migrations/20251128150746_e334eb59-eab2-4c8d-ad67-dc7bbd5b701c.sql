-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view all files" ON public.files;

-- Update the "Anyone can view public files" policy to include owner access
DROP POLICY IF EXISTS "Anyone can view public files" ON public.files;

-- Create a more restrictive policy: users can see public files OR their own files
CREATE POLICY "Users can view public files or own files" 
ON public.files 
FOR SELECT 
USING (
  is_public = true 
  OR uploaded_by = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);