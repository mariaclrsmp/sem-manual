import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface Routine {
  id: string
  user_id: string
  title: string
  category: string
  frequency_days: number
  last_done: string | null
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
      const suggestions: {
        user_id: string
        message: string
        action: string | null
        type: 'tip' | 'task' | 'guide'
        date: string
        read: boolean
        routine_id: string | null
      }[] = []

      const { data: routines } = await supabase
        .from('routines')
        .select('id, user_id, title, category, frequency_days, last_done')
        .eq('user_id', user.id)
        .eq('active', true)

      const overdue = ((routines ?? []) as Routine[]).filter((r) => {
        if (!r.last_done) return true
        const nextDue = new Date(r.last_done)
        nextDue.setDate(nextDue.getDate() + r.frequency_days)
        return nextDue <= new Date()
      }).slice(0, 2)

      for (const routine of overdue) {
        const lastDone = routine.last_done ? new Date(routine.last_done) : null
        const daysAgo = lastDone
          ? Math.floor((Date.now() - lastDone.getTime()) / 86_400_000)
          : routine.frequency_days

        const messages: Record<string, string> = {
          cleaning: `Faz ${daysAgo} dia${daysAgo !== 1 ? 's' : ''} desde a ultima limpeza. Hora de dar uma geral!`,
          grocery: `Sua lista de compras pode estar desatualizada ha ${daysAgo} dia${daysAgo !== 1 ? 's' : ''}.`,
          home: `A tarefa "${routine.title}" esta atrasada ha ${daysAgo} dia${daysAgo !== 1 ? 's' : ''}.`,
          pet: `Seu pet precisa de atencao — ${routine.title} esta em atraso.`,
          maintenance: `Manutencao pendente: "${routine.title}" ha ${daysAgo} dia${daysAgo !== 1 ? 's' : ''}.`,
        }

        suggestions.push({
          user_id: user.id,
          message: messages[routine.category] ?? `"${routine.title}" esta atrasado ha ${daysAgo} dia${daysAgo !== 1 ? 's' : ''}.`,
          action: 'Adicionar a lista de hoje?',
          type: 'task',
          date: today,
          read: false,
          routine_id: routine.id,
        })
      }

      if (suggestions.length < 3 && dayOfWeek === 6) {
        const hasRoutineSuggestion = suggestions.some((s) => s.routine_id)
        if (!hasRoutineSuggestion) {
          suggestions.push({
            user_id: user.id,
            message: 'Sabado e um otimo dia para uma faxina geral na casa.',
            action: 'Ver guias de limpeza',
            type: 'tip',
            date: today,
            read: false,
            routine_id: null,
          })
        }
      }

      if (suggestions.length < 3 && dayOfWeek === 0) {
        suggestions.push({
          user_id: user.id,
          message: 'Organize sua semana: veja o que precisa ser feito em casa.',
          action: 'Planejar a semana',
          type: 'tip',
          date: today,
          read: false,
          routine_id: null,
        })
      }

      if (suggestions.length === 0) {
        suggestions.push({
          user_id: user.id,
          message: 'Sua casa esta em dia! Continue mantendo a rotina.',
          action: null,
          type: 'tip',
          date: today,
          read: false,
          routine_id: null,
        })
      }

      await supabase
        .from('daily_suggestions')
        .delete()
        .eq('user_id', user.id)
        .eq('date', today)

      const { error: insertError } = await supabase
        .from('daily_suggestions')
        .insert(suggestions)

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
