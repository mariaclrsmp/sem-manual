import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type UserLevel = 'beginner' | 'learner' | 'independent' | 'master'

interface ProcessXPRequest {
  userId: string
  amount: number
  reason: 'task_completed' | 'guide_read' | 'achievement_unlocked'
}

interface ProcessXPResponse {
  totalXP: number
  level: UserLevel
  leveledUp: boolean
  newLevel?: UserLevel
}

const LEVEL_BANDS: { level: UserLevel; minXP: number }[] = [
  { level: 'beginner',    minXP: 0    },
  { level: 'learner',     minXP: 201  },
  { level: 'independent', minXP: 501  },
  { level: 'master',      minXP: 1001 },
]

function resolveLevel(xp: number): UserLevel {
  return (
    [...LEVEL_BANDS].reverse().find((b) => xp >= b.minXP)?.level ?? 'beginner'
  )
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: ProcessXPRequest
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { userId, amount, reason } = body

  if (!userId || typeof amount !== 'number' || amount <= 0 || !reason) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: { user }, error: authError } = await userClient.auth.getUser()

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (user.id !== userId) {
    return new Response(JSON.stringify({ error: 'Forbidden: userId mismatch' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: currentUser, error: fetchError } = await adminClient
    .from('users')
    .select('xp_total, level')
    .eq('id', userId)
    .single()

  if (fetchError || !currentUser) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const previousLevel = currentUser.level as UserLevel
  const totalXP = (currentUser.xp_total as number) + amount
  const level = resolveLevel(totalXP)
  const leveledUp = level !== previousLevel

  const { error: updateError } = await adminClient
    .from('users')
    .update({ xp_total: totalXP, level })
    .eq('id', userId)

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (leveledUp) {
    await adminClient.from('events').insert({
      user_id: userId,
      type: 'level_up',
      data: { previousLevel, newLevel: level, xp: totalXP, reason },
    })
  }

  const response: ProcessXPResponse = {
    totalXP,
    level,
    leveledUp,
    ...(leveledUp && { newLevel: level }),
  }

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
