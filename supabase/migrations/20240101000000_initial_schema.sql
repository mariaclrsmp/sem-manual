-- =============================================================================
-- Sem Manual — Schema inicial
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSÕES
-- ---------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ---------------------------------------------------------------------------
-- TABELA: users
-- Perfil do usuário. Criada automaticamente pelo trigger handle_new_user.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  total_xp    INTEGER NOT NULL DEFAULT 0,
  level       TEXT NOT NULL DEFAULT 'beginner'
                CHECK (level IN ('beginner', 'learner', 'independent', 'master')),
  profile     JSONB,         -- { home_type, has_pet, push_token }
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users: leitura própria"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users: escrita própria"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users: atualização própria"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);


-- ---------------------------------------------------------------------------
-- TABELA: tasks
-- Tarefas diárias do usuário.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL
                CHECK (category IN ('cleaning', 'grocery', 'home', 'pet', 'maintenance')),
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  xp          INTEGER NOT NULL DEFAULT 10,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tasks_user_date_idx ON public.tasks(user_id, date);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks: leitura própria"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "tasks: inserção própria"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks: atualização própria"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "tasks: exclusão própria"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- TABELA: routines
-- Rotinas recorrentes (lavar roupa, limpar banheiro, etc.).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.routines (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL,
  frequency_days  INTEGER NOT NULL DEFAULT 7,
  last_done       DATE,
  active          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS routines_user_active_idx ON public.routines(user_id, active);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routines: leitura própria"
  ON public.routines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "routines: inserção própria"
  ON public.routines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routines: atualização própria"
  ON public.routines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "routines: exclusão própria"
  ON public.routines FOR DELETE
  USING (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- VIEW: rotinas_atrasadas
-- Rotinas ativas onde a data de vencimento (last_done + frequency_days)
-- já passou. Usada pelo suggestionsService.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.rotinas_atrasadas AS
SELECT *
FROM public.routines
WHERE active = TRUE
  AND (
    last_done IS NULL
    OR (last_done + frequency_days * INTERVAL '1 day')::DATE <= CURRENT_DATE
  );


-- ---------------------------------------------------------------------------
-- TABELA: events
-- Registro de ações do usuário para conquistas e analytics.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL
                CHECK (type IN (
                  'task_completed',
                  'guide_read',
                  'emergency_used',
                  'achievement_unlocked',
                  'diagnostic_done',
                  'level_up'
                )),
  data        JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_user_type_idx ON public.events(user_id, type);
CREATE INDEX IF NOT EXISTS events_user_created_idx ON public.events(user_id, created_at DESC);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events: leitura própria"
  ON public.events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "events: inserção própria"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- TABELA: achievements
-- Conquistas desbloqueadas pelo usuário.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id  TEXT NOT NULL,
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS achievements_user_idx ON public.achievements(user_id);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements: leitura própria"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "achievements: inserção própria"
  ON public.achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- TABELA: read_guides
-- Guias lidos pelo usuário (para XP e conquistas).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.read_guides (
  user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  guide_id  TEXT NOT NULL,
  read_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, guide_id)
);

ALTER TABLE public.read_guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_guides: leitura própria"
  ON public.read_guides FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "read_guides: inserção própria"
  ON public.read_guides FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- TRIGGER: handle_new_user
-- Cria o perfil em public.users automaticamente após cadastro no Auth.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, total_xp, level, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    0,
    'beginner',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
