-- Create enum type for EA mode
CREATE TYPE ea_mode_type AS ENUM ('auto', 'hybrid');

-- Add ea_mode column to files table
ALTER TABLE public.files ADD COLUMN ea_mode ea_mode_type;