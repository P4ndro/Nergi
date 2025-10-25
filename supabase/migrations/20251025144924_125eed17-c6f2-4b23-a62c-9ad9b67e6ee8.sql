-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  location_lat DECIMAL(10, 8),
  location_lon DECIMAL(11, 8),
  location_region TEXT,
  location_consent_given BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create user_crops table for tracking crops
CREATE TABLE public.user_crops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  variety TEXT,
  status TEXT NOT NULL CHECK (status IN ('planned', 'planted', 'harvested')),
  planting_date DATE,
  planned_date DATE,
  area_value DECIMAL(10, 2),
  area_unit TEXT CHECK (area_unit IN ('m2', 'ha')),
  planting_method TEXT CHECK (planting_method IN ('direct_seed', 'transplant')),
  seed_source TEXT,
  field_name TEXT,
  field_lat DECIMAL(10, 8),
  field_lon DECIMAL(11, 8),
  irrigation_method TEXT,
  notes TEXT,
  suitability_verdict TEXT,
  recommendations JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_crops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own crops"
  ON public.user_crops FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own crops"
  ON public.user_crops FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own crops"
  ON public.user_crops FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own crops"
  ON public.user_crops FOR DELETE
  USING (auth.uid() = user_id);

-- Create chemical_applications table
CREATE TABLE public.chemical_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.user_crops(id) ON DELETE CASCADE,
  chemical_name TEXT NOT NULL,
  application_date DATE NOT NULL,
  amount TEXT,
  applicator_type TEXT CHECK (applicator_type IN ('licensed', 'self')),
  reason TEXT,
  is_approved BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chemical_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chemical applications"
  ON public.chemical_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chemical applications"
  ON public.chemical_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create crop_database reference table (visible to all)
CREATE TABLE public.crop_database (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_name TEXT NOT NULL,
  common_names TEXT[],
  optimal_ph_min DECIMAL(3, 1),
  optimal_ph_max DECIMAL(3, 1),
  soil_preference TEXT,
  planting_regions JSONB,
  pest_risks JSONB,
  recommended_rotation TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.crop_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crop database"
  ON public.crop_database FOR SELECT
  USING (true);

-- Insert some sample crops
INSERT INTO public.crop_database (crop_name, common_names, optimal_ph_min, optimal_ph_max, soil_preference, planting_regions, pest_risks) VALUES
('Corn', ARRAY['Maize', 'Sweet Corn'], 5.8, 7.0, 'Well-drained loamy soil', '{"samegrelo": {"start": "04-15", "end": "06-15"}, "kakheti": {"start": "04-01", "end": "06-30"}}', '{"fungal": ["leaf_spot", "rust"], "insect": ["corn_borer"]}'),
('Tomato', ARRAY['Tomatoes'], 6.0, 6.8, 'Rich, well-drained soil', '{"samegrelo": {"start": "03-15", "end": "05-30"}, "kakheti": {"start": "03-01", "end": "06-15"}}', '{"fungal": ["blight", "wilt"], "insect": ["aphids", "hornworm"]}'),
('Wheat', ARRAY['Winter Wheat'], 6.0, 7.0, 'Well-drained fertile soil', '{"samegrelo": {"start": "10-01", "end": "11-30"}, "kakheti": {"start": "09-15", "end": "11-15"}}', '{"fungal": ["rust", "smut"], "insect": ["wheat_midge"]}'),
('Potato', ARRAY['Potatoes'], 5.0, 6.5, 'Loose, well-drained soil', '{"samegrelo": {"start": "03-01", "end": "05-15"}, "kakheti": {"start": "03-15", "end": "05-30"}}', '{"fungal": ["late_blight"], "insect": ["colorado_beetle"]}'),
('Cucumber', ARRAY['Cucumbers'], 6.0, 7.0, 'Rich, moist soil', '{"samegrelo": {"start": "04-15", "end": "06-30"}, "kakheti": {"start": "04-01", "end": "07-15"}}', '{"fungal": ["powdery_mildew"], "insect": ["aphids", "cucumber_beetle"]}');

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply update triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_crops_updated_at
  BEFORE UPDATE ON public.user_crops
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();