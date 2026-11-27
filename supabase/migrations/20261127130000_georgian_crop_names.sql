-- Let Georgian speakers find crops by their Georgian names in the crop search.
UPDATE public.crop_database
SET common_names = array_append(coalesce(common_names, '{}'), v.ka_name)
FROM (VALUES
  ('Corn', 'სიმინდი'),
  ('Tomato', 'პომიდორი'),
  ('Wheat', 'ხორბალი'),
  ('Potato', 'კარტოფილი'),
  ('Cucumber', 'კიტრი')
) AS v(crop_name, ka_name)
WHERE crop_database.crop_name = v.crop_name
  AND NOT (v.ka_name = ANY (coalesce(crop_database.common_names, '{}')));
