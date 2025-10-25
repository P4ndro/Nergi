-- Create soil_reports table for storing soil analysis data
CREATE TABLE IF NOT EXISTS public.soil_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT,
  sampled_at TIMESTAMPTZ,
  crop TEXT,
  pdf_text TEXT,           -- full extracted text
  ph NUMERIC,
  nitrogen NUMERIC,
  phosphorus NUMERIC,
  potassium NUMERIC,
  organic_matter NUMERIC,
  electrical_conductivity NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.soil_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own soil reports"
  ON public.soil_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own soil reports"
  ON public.soil_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own soil reports"
  ON public.soil_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own soil reports"
  ON public.soil_reports FOR DELETE
  USING (auth.uid() = user_id);

