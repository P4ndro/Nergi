-- Add more common Georgian crops to the reference list used by crop search and the AI.
-- Planting windows are approximate (MM-DD) and should be checked by an agronomist.
-- Safe to run more than once: crops that already exist are skipped.
INSERT INTO public.crop_database
  (crop_name, common_names, optimal_ph_min, optimal_ph_max, soil_preference, planting_regions, pest_risks, recommended_rotation)
SELECT v.crop_name, v.common_names, v.ph_min, v.ph_max, v.soil, v.regions::jsonb, v.pests::jsonb, v.rotation
FROM (VALUES
  ('Pepper', ARRAY['Bell Pepper', 'Capsicum', 'წიწაკა'], 6.0, 6.8, 'Warm, well-drained loamy soil',
    '{"samegrelo": {"start": "04-20", "end": "06-01"}, "kakheti": {"start": "04-15", "end": "05-31"}}',
    '{"fungal": ["phytophthora_blight"], "insect": ["aphids", "thrips"]}',
    ARRAY['Bean', 'Onion', 'Wheat']),
  ('Grape', ARRAY['Grapevine', 'ყურძენი', 'ვაზი'], 5.5, 7.0, 'Deep, well-drained soil; tolerates stony ground',
    '{"samegrelo": {"start": "03-01", "end": "04-30"}, "kakheti": {"start": "03-01", "end": "04-30"}}',
    '{"fungal": ["downy_mildew", "powdery_mildew"], "insect": ["grape_berry_moth"]}',
    NULL),
  ('Bean', ARRAY['Common Bean', 'Kidney Bean', 'ლობიო'], 6.0, 7.0, 'Well-drained, moderately fertile soil',
    '{"samegrelo": {"start": "04-20", "end": "06-15"}, "kakheti": {"start": "04-15", "end": "06-30"}}',
    '{"fungal": ["anthracnose", "rust"], "insect": ["bean_weevil", "aphids"]}',
    ARRAY['Corn', 'Potato', 'Wheat']),
  ('Onion', ARRAY['Onions', 'ხახვი'], 6.0, 7.0, 'Loose, well-drained soil free of stones',
    '{"samegrelo": {"start": "03-01", "end": "04-15"}, "kakheti": {"start": "03-01", "end": "04-15"}}',
    '{"fungal": ["downy_mildew"], "insect": ["onion_thrips", "onion_fly"]}',
    ARRAY['Tomato', 'Cucumber', 'Bean']),
  ('Eggplant', ARRAY['Aubergine', 'ბადრიჯანი'], 5.8, 6.8, 'Warm, fertile, well-drained soil',
    '{"samegrelo": {"start": "05-01", "end": "06-15"}, "kakheti": {"start": "04-25", "end": "06-10"}}',
    '{"fungal": ["verticillium_wilt"], "insect": ["colorado_beetle", "spider_mites"]}',
    ARRAY['Bean', 'Onion', 'Wheat'])
) AS v(crop_name, common_names, ph_min, ph_max, soil, regions, pests, rotation)
WHERE NOT EXISTS (
  SELECT 1 FROM public.crop_database c WHERE lower(c.crop_name) = lower(v.crop_name)
);
