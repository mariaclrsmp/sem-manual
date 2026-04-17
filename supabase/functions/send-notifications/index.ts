import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface PushNotification {
  to: string
  title: string
  body: string
  data: Record<string, unknown>
}

interface UserRow {
  id: string
  push_token: string
}

interface SuggestionRow {
  id: string
  message: string
}

interface ExpoTicket {
  status: 'ok' | 'error'
  id?: string
  message?: string
}

const TITLE = 'Sem Manual'

const FALLBACK_MESSAGES = [
  'Bom dia! Que tal manter a casa em ordem hoje? 🏠',
  'Bom dia! Pequenas tarefas diárias fazem grande diferença. ✨',
  'Bom dia! Sua casa, suas regras — e você está indo bem. 🌱',
]

function fallbackMessage(): string {
  return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)]
}

async function sendBatch(
  notifications: PushNotification[],
): Promise<ExpoTicket[]> {
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notifications),
  })

  const json = await res.json()
  return (json.data ?? []) as ExpoTicket[]
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const today = new Date().toISOString().split('T')[0]

  const { data: usersWithToken, error: usersError } = await supabase
    .from('users')
    .select('id, push_token')
    .not('push_token', 'is', null)

  if (usersError) {
    return new Response(JSON.stringify({ error: usersError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const users = (usersWithToken ?? []) as UserRow[]

  if (users.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, sent: 0, message: 'No users with push token' }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  const userIds = users.map((u) => u.id)

  const { data: suggestions } = await supabase
    .from('daily_suggestions')
    .select('id, user_id, message')
    .in('user_id', userIds)
    .eq('date', today)
    .eq('read', false)

  const suggestionsByUser = new Map<string, SuggestionRow>()
  for (const s of (suggestions ?? []) as (SuggestionRow & { user_id: string })[]) {
    if (!suggestionsByUser.has(s.user_id)) {
      suggestionsByUser.set(s.user_id, s)
    }
  }

  const notifications: PushNotification[] = []
  const notificationMeta: { user_id: string; suggestion_id?: string }[] = []

  for (const user of users) {
    const suggestion = suggestionsByUser.get(user.id)
    const body = suggestion
      ? `Bom dia! ${suggestion.message} 🏠`
      : fallbackMessage()

    notifications.push({
      to: user.push_token,
      title: TITLE,
      body,
      data: { suggestionId: suggestion?.id ?? null, date: today },
    })

    notificationMeta.push({
      user_id: user.id,
      suggestion_id: suggestion?.id,
    })
  }

  const BATCH_SIZE = 100
  const tickets: ExpoTicket[] = []

  for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
    const batch = notifications.slice(i, i + BATCH_SIZE)
    const batchTickets = await sendBatch(batch)
    tickets.push(...batchTickets)
  }

  const successUserIds = tickets
    .map((ticket, idx) => (ticket.status === 'ok' ? notificationMeta[idx].user_id : null))
    .filter(Boolean) as string[]

  if (successUserIds.length > 0) {
    await supabase.from('events').insert(
      successUserIds.map((user_id) => ({
        user_id,
        type: 'push_sent',
        data: { date: today },
      })),
    )
  }

  const failed = tickets.filter((t) => t.status === 'error')

  return new Response(
    JSON.stringify({
      ok: true,
      date: today,
      sent: successUserIds.length,
      failed: failed.length,
      ...(failed.length > 0 && {
        errors: failed.map((t) => t.message),
      }),
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
