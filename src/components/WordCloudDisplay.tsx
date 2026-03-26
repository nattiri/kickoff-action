'use client'

import { useEffect, useState, useCallback } from 'react'
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

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {[...grouped.entries()].map(([category, catPosts]) => {
          const color = getCategoryColor(category)
          return (
            <div
              key={category}
              className="break-inside-avoid bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className={`${color.bg} ${color.text} px-4 py-2 font-bold text-lg`}>
                {category}
                <span className="ml-2 text-sm font-normal opacity-80">
                  {catPosts.length}件
                </span>
              </div>
              <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {catPosts.map((post) => (
                  <li key={post.id} className="px-4 py-3 text-gray-800 text-sm leading-relaxed">
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
