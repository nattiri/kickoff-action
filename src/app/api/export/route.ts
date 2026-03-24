import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { Post } from '@/lib/supabase'

export async function GET() {
  const serviceClient = getServiceClient()

  const { data, error } = await serviceClient
    .from('posts')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const header = 'id,text,keywords,created_at\n'
  const rows = (data as Post[])
    .map((post) => {
      const text = `"${post.text.replace(/"/g, '""')}"`
      const keywords = `"${post.keywords.join(',')}"`
      return `${post.id},${text},${keywords},${post.created_at}`
    })
    .join('\n')

  const csv = '\uFEFF' + header + rows

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kickoff-actions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
