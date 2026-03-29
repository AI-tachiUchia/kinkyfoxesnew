
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getSupabase(token: string | null) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}
  )
}

function getToken(request: Request) {
  return request.headers.get('Authorization')?.replace('Bearer ', '') ?? null
}

export async function POST(request: Request) {
  const supabase = getSupabase(getToken(request))
  const { name, description } = await request.json()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) console.error('getUser error:', userError)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_toys')
    .insert([{ user_id: user.id, name, description }])
    .select()

  if (error) {
    console.error('POST /api/toys error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = getSupabase(getToken(request))
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('user_toys')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function GET(request: Request) {
  const supabase = getSupabase(getToken(request))

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('user_toys')
    .select('*')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
