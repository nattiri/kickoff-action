'use client'

import { useEffect, useState } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { getCategoryColor } from '@/lib/categoryColor'

const MAX_ITEMS = 12

export default function LiveFeedPanel() {
  const [feed, setFeed] = useState<Post[]>([])

  useEffect(() => {
    const channel = supabase
      .channel('live-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          const post = payload.new as Post
          setFeed(prev => [post, ...prev].slice(0, MAX_ITEMS))
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="w-72 flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm font-bold text-white/80 tracking-widest">LIVE</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hover">
        {feed.length === 0 ? (
          <p className="text-white/30 text-xs text-center mt-6">新着投稿を待機中...</p>
        ) : (
          feed.map((post) => {
            const color = getCategoryColor(post.category)
            return (
              <div
                key={post.id}
                className="animate-fade-slide-in bg-white/5 rounded-xl p-3 border border-white/10"
              >
                <span className={`${color.badge} text-xs px-2 py-0.5 rounded-full`}>
                  {post.category}
                </span>
                <p className="text-white/80 text-xs mt-2 leading-relaxed line-clamp-3">
                  {post.text}
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
