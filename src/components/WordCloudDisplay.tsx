'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { getCategoryColor } from '@/lib/categoryColor'

function groupByCategory(posts: Post[]): Map<string, Post[]> {
  const map = new Map<string, Post[]>()
  for (const post of posts) {
    const cat = post.category || 'その他'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat)!.push(post)
  }
  return map
}

export default function WordCloudDisplay() {
  const [posts, setPosts] = useState<Post[]>([])
  const [grouped, setGrouped] = useState<Map<string, Post[]>>(new Map())
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set())
  const initialLoadDone = useRef(false)

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: true })
    if (data) {
      const p = data as Post[]
      setPosts(p)
      setGrouped(groupByCategory(p))
    }
  }, [])

  useEffect(() => {
    fetchPosts().then(() => { initialLoadDone.current = true })

    const channel = supabase
      .channel('posts-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          if (!initialLoadDone.current) return
          const newId = payload.new.id as string
          setNewPostIds(prev => new Set([...prev, newId]))
          setTimeout(() => {
            setNewPostIds(prev => {
              const next = new Set(prev)
              next.delete(newId)
              return next
            })
          }, 2500)
          fetchPosts()
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'posts' },
        () => { fetchPosts() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchPosts])

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/40 text-xl">
        まだ投稿がありません
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6 scrollbar-hover">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {[...grouped.entries()].map(([category, catPosts]) => {
          const color = getCategoryColor(category)
          return (
            <div
              key={category}
              className="break-inside-avoid rounded-2xl shadow-2xl overflow-hidden border border-white/10"
            >
              <div className={`${color.bg} bg-gradient-to-r px-4 py-3 font-bold text-lg flex items-center justify-between`}>
                <span>{category}</span>
                <span className="text-sm font-normal bg-black/20 px-2 py-0.5 rounded-full">
                  {catPosts.length}件
                </span>
              </div>
              <ul className="divide-y divide-white/5 max-h-80 overflow-y-auto bg-white/5 backdrop-blur-sm scrollbar-hover">
                {catPosts.map((post) => (
                  <li
                    key={post.id}
                    className={`px-4 py-3 text-white/90 text-sm leading-relaxed transition-colors ${
                      newPostIds.has(post.id)
                        ? 'animate-fade-slide-in bg-blue-400/20'
                        : ''
                    }`}
                  >
                    {post.text}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
