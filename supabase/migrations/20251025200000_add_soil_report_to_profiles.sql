-- Add soil report data to profiles table
-- This stores the most recent soil report data uploaded by the user

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS soil_report_data JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS soil_report_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS soil_report_location TEXT;

COMMENT ON COLUMN public.profiles.soil_report_data IS 'Latest soil report summary data extracted by AI (pH, nutrients, etc.)';
COMMENT ON COLUMN public.profiles.soil_report_date IS 'Date when the soil report was uploaded/analyzed';
COMMENT ON COLUMN public.profiles.soil_report_location IS 'Location/field name where soil sample was taken';

