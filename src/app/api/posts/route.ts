import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { extractKeywords } from '@/lib/claude'

export async function GET() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { text, sessionId } = body

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: '行動宣言を入力してください' }, { status: 400 })
  }

  if (text.length > 140) {
    return NextResponse.json({ error: '140文字以内で入力してください' }, { status: 400 })
  }

  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'セッションIDが不正です' }, { status: 400 })
  }

  const keywords = await extractKeywords(text.trim())

  const { data, error } = await supabase
    .from('posts')
    .insert({ text: text.trim(), keywords, session_id: sessionId })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
