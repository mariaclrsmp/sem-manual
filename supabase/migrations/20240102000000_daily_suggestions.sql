-- =============================================================================
-- daily_suggestions
-- Sugestoes diarias geradas pelo app e persistidas por usuario/dia.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.daily_suggestions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  action      TEXT,
  type        TEXT NOT NULL
                CHECK (type IN ('tip', 'task', 'guide')),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  routine_id  UUID REFERENCES public.routines(id) ON DELETE SET NULL,
  UNIQUE (user_id, message, date)
);

CREATE INDEX IF NOT EXISTS daily_suggestions_user_date_idx
  ON public.daily_suggestions(user_id, date);

ALTER TABLE public.daily_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_suggestions: leitura propria"
  ON public.daily_suggestions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "daily_suggestions: insercao propria"
  ON public.daily_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_suggestions: atualizacao propria"
  ON public.daily_suggestions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "daily_suggestions: exclusao propria"
  ON public.daily_suggestions FOR DELETE
  USING (auth.uid() = user_id);
