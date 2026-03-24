'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { supabase, Post } from '@/lib/supabase'

const ReactWordcloud = dynamic(() => import('react-wordcloud'), { ssr: false })

type WordData = {
  text: string
  value: number
}

const options = {
  rotations: 2,
  rotationAngles: [-30, 30] as [number, number],
  fontSizes: [16, 80] as [number, number],
  fontFamily: 'Noto Sans JP, sans-serif',
  padding: 4,
  enableTooltip: false,
  deterministic: false,
  transitionDuration: 800,
}

function buildWordData(posts: Post[]): WordData[] {
  const freq: Record<string, number> = {}
  for (const post of posts) {
    for (const kw of post.keywords) {
      freq[kw] = (freq[kw] ?? 0) + 1
    }
  }
  return Object.entries(freq).map(([text, value]) => ({ text, value }))
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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => { fetchPosts() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchPosts])

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xl">
        まだ投稿がありません
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <ReactWordcloud words={words} options={options} />
    </div>
  )
}
