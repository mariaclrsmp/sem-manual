import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface OverdueRoutine {
  id: string
  user_id: string
  title: string
  category: string
  frequency_days: number
  last_done: string | null
}

interface DailySuggestion {
  user_id: string
  message: string
  action?: string
  type: 'alert' | 'tip'
  date: string
  routine_id?: string
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const dayOfWeek = new Date().getDay()

  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  })

  if (usersError) {
    return new Response(
      JSON.stringify({ error: usersError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const activeUsers = users.filter(
    (u) => u.last_sign_in_at && new Date(u.last_sign_in_at) >= new Date(sevenDaysAgo),
  )

  const errors: string[] = []
  let processed = 0

  for (const user of activeUsers) {
    try {
      const suggestions: DailySuggestion[] = []

      const { data: overdue } = await supabase
        .from('rotinas_atrasadas')
        .select('id, user_id, title, category, frequency_days, last_done')
        .eq('user_id', user.id)
        .order('last_done', { ascending: true, nullsFirst: true })
        .limit(2)

      for (const routine of (overdue ?? []) as OverdueRoutine[]) {
        const lastDone = routine.last_done ? new Date(routine.last_done) : null
        const daysAgo = lastDone
          ? Math.floor((Date.now() - lastDone.getTime()) / 86_400_000)
          : routine.frequency_days

        suggestions.push({
          user_id: user.id,
          message: `It's been ${daysAgo} day${daysAgo !== 1 ? 's' : ''} since you ${routine.title.toLowerCase()}`,
          action: "Add to today's list?",
          type: 'alert',
          date: today,
          routine_id: routine.id,
        })
      }

      if (suggestions.length < 3 && dayOfWeek === 6) {
        const hasCleaningRoutine = (overdue ?? []).some(
          (r: OverdueRoutine) => r.category === 'cleaning',
        )
        if (!hasCleaningRoutine) {
          suggestions.push({
            user_id: user.id,
            message: "Saturday is a great day for a deep clean",
            action: "Add to today's list?",
            type: 'tip',
            date: today,
          })
        }
      }

      if (suggestions.length < 3 && dayOfWeek === 0) {
        suggestions.push({
          user_id: user.id,
          message: "Organize your week: check what needs to be done at home",
          action: "Plan the week",
          type: 'tip',
          date: today,
        })
      }

      if (suggestions.length === 0) {
        processed++
        continue
      }

      await supabase
        .from('daily_suggestions')
        .delete()
        .eq('user_id', user.id)
        .eq('date', today)

      const { error: insertError } = await supabase
        .from('daily_suggestions')
        .insert(suggestions.map((s) => ({ ...s, read: false })))

      if (insertError) {
        errors.push(`${user.id}: ${insertError.message}`)
      } else {
        processed++
      }
    } catch (e) {
      errors.push(`${user.id}: ${(e as Error).message}`)
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      date: today,
      total: activeUsers.length,
      processed,
      ...(errors.length > 0 && { errors }),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
