-- ============================================================================
-- 002_terms_in_signup_metadata.sql
-- ----------------------------------------------------------------------------
-- Pas de auth-trigger aan zodat terms_accepted_at en privacy_accepted_at uit
-- raw_user_meta_data worden gelezen als ze meegegeven zijn bij Supabase signUp.
--
-- Waarom: e-mail/wachtwoord-gebruikers accepteren de voorwaarden al in het
-- registratieformulier. Zonder deze trigger-update blijven die velden NULL
-- en stuurt de OAuth-callback ze onnodig naar /auth/accept-terms.
--
-- Google OAuth-gebruikers sturen geen terms_accepted_at metadata, dus die
-- blijven via de bestaande accept-terms flow lopen.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, terms_accepted_at, privacy_accepted_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'given_name', -- Google OAuth
      ''
    ),
    NULLIF(NEW.raw_user_meta_data->>'terms_accepted_at', '')::timestamptz,
    NULLIF(NEW.raw_user_meta_data->>'privacy_accepted_at', '')::timestamptz
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_auth_user() IS
  'Maakt automatisch public.users rij aan na Supabase Auth registratie. Haalt voornaam uit raw_user_meta_data (first_name of given_name voor Google OAuth). Slaat terms_accepted_at en privacy_accepted_at op als die in raw_user_meta_data zijn meegegeven (e-mail/wachtwoord registratie).';
