-- Tighten row-level security and fill gaps left by the first migration.
-- Safe to run more than once.

-- Users who signed up before the profile trigger existed have no profile row,
-- which breaks the dashboard and Add Crop. Create the missing rows.
INSERT INTO public.profiles (id, name)
SELECT u.id, u.raw_user_meta_data->>'name'
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Updates must not be able to move a row to another user.
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own crops" ON public.user_crops;
CREATE POLICY "Users can update their own crops"
  ON public.user_crops FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Chemical records may only point at the user's own crops.
DROP POLICY IF EXISTS "Users can insert their own chemical applications" ON public.chemical_applications;
CREATE POLICY "Users can insert their own chemical applications"
  ON public.chemical_applications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      crop_id IS NULL
      OR EXISTS (SELECT 1 FROM public.user_crops c WHERE c.id = crop_id AND c.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update their own chemical applications" ON public.chemical_applications;
CREATE POLICY "Users can update their own chemical applications"
  ON public.chemical_applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own chemical applications" ON public.chemical_applications;
CREATE POLICY "Users can delete their own chemical applications"
  ON public.chemical_applications FOR DELETE
  USING (auth.uid() = user_id);
