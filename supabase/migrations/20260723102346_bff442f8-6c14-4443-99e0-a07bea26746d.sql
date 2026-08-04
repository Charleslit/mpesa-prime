
-- ============ Roles enum ============
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');

-- ============ Profiles table ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text NOT NULL DEFAULT 'User',
  initials text NOT NULL DEFAULT 'U',
  logo_url text,
  balance numeric(14,2) NOT NULL DEFAULT 0,
  fuliza_balance numeric(14,2) NOT NULL DEFAULT 463.91,
  airtime_balance numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ User roles ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============ Contacts (recipients for send money) ============
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  initials text NOT NULL DEFAULT '?',
  tint text NOT NULL DEFAULT 'primary',
  is_favourite boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- ============ Transactions log ============
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name text NOT NULL,
  recipient_phone text,
  amount numeric(14,2) NOT NULL,
  transaction_cost numeric(14,2) NOT NULL DEFAULT 0,
  ref_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============ RLS policies ============
-- profiles
CREATE POLICY "profiles self select" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- user_roles (read own, super_admin reads all)
CREATE POLICY "user_roles self select" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));

-- contacts (own)
CREATE POLICY "contacts own" ON public.contacts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- transactions (own)
CREATE POLICY "tx own select" ON public.transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "tx own insert" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============ Trigger: auto-create profile & role on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  fallback_name text;
  fallback_initials text;
BEGIN
  fallback_name := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1));
  fallback_initials := COALESCE(
    NEW.raw_user_meta_data->>'initials',
    upper(substring(regexp_replace(fallback_name, '[^A-Za-z]', '', 'g') FROM 1 FOR 2))
  );
  IF fallback_initials IS NULL OR fallback_initials = '' THEN
    fallback_initials := 'U';
  END IF;

  INSERT INTO public.profiles (id, email, display_name, initials)
  VALUES (NEW.id, NEW.email, fallback_name, fallback_initials);

  IF lower(NEW.email) = 'super3momentum@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin')
      ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Send money RPC (atomic balance decrement) ============
CREATE OR REPLACE FUNCTION public.send_money(
  _recipient_name text,
  _recipient_phone text,
  _amount numeric,
  _ref_code text
) RETURNS public.transactions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _bal numeric;
  _tx public.transactions;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'invalid amount'; END IF;

  SELECT balance INTO _bal FROM public.profiles WHERE id = _uid FOR UPDATE;
  IF _bal IS NULL THEN RAISE EXCEPTION 'profile missing'; END IF;
  IF _bal < _amount THEN RAISE EXCEPTION 'insufficient balance'; END IF;

  UPDATE public.profiles SET balance = balance - _amount WHERE id = _uid;

  INSERT INTO public.transactions (user_id, recipient_name, recipient_phone, amount, ref_code)
  VALUES (_uid, _recipient_name, _recipient_phone, _amount, _ref_code)
  RETURNING * INTO _tx;

  RETURN _tx;
END;
$$;
GRANT EXECUTE ON FUNCTION public.send_money(text, text, numeric, text) TO authenticated;
