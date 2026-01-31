-- 1. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- 2. Create optimized policies using JWT metadata (Avoids recursion)
-- This checks the 'role' inside the auth token instead of querying the table
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- 3. Ensure User policies are clean and allow self-access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (
  auth.uid() = id
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id
);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (
  auth.uid() = id
);
