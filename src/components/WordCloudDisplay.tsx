'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, Post } from '@/lib/supabase'

type WordData = {
  text: string
  value: number
}

const COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
  '#EF4444', '#06B6D4', '#EC4899', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#A855F7',
]

function buildWordData(posts: Post[]): WordData[] {
  const freq: Record<string, number> = {}
  for (const post of posts) {
    for (const kw of post.keywords) {
      freq[kw] = (freq[kw] ?? 0) + 1
    }
  }
  return Object.entries(freq)
    .map(([text, value]) => ({ text, value }))
    .sort((a, b) => b.value - a.value)
}

function getFontSize(value: number, min: number, max: number): number {
  if (max === min) return 48
  return 20 + ((value - min) / (max - min)) * 72
}

export default function WordCloudDisplay() {
  const [posts, setPosts] = useState<Post[]>([])
  const [words, setWords] = useState<WordData[]>([])

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase.from('posts').select('*')
    if (data) {
      setPosts(data as Post[])
      setWords(buildWordData(data as Post[]))
    }
  }, [])

  useEffect(() => {
    fetchPosts()

    const channel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchPosts])

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-xl">
        まだ投稿がありません
      </div>
    )
  }

  const values = words.map(w => w.value)
  const min = Math.min(...values)
  const max = Math.max(...values)

  return (
    <div className="flex flex-wrap gap-x-6 gap-y-4 items-center justify-center p-8 h-full content-center">
      {words.map((word, i) => (
        <span
          key={word.text}
          className="font-bold transition-all duration-700 leading-tight"
          style={{
            fontSize: `${getFontSize(word.value, min, max)}px`,
            color: COLORS[i % COLORS.length],
          }}
        >
          {word.text}
        </span>
      ))}
    </div>
  )
}
