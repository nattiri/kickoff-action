'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, Post } from '@/lib/supabase'
import { getCategoryColor } from '@/lib/categoryColor'

export default function PostListDisplay() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setPosts(data as Post[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPosts()
    const channel = supabase
      .channel('list-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchPosts])

  if (loading) {
    return <p className="text-gray-400 text-center py-12">読み込み中...</p>
  }

  return (
    <div className="h-full flex flex-col p-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto rounded-lg border border-gray-700">
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">まだ投稿がありません</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-700 text-gray-200 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 w-1/2">投稿テキスト</th>
                <th className="text-left px-4 py-3 w-1/6">カテゴリ</th>
                <th className="text-left px-4 py-3 w-1/4">投稿時刻</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {posts.map((post) => (
                <tr key={post.id} className="text-gray-200 hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 leading-relaxed">{post.text}</td>
                  <td className="px-4 py-3">
                    <span className={`${getCategoryColor(post.category || 'その他').badge} text-xs px-2 py-1 rounded-full whitespace-nowrap`}>
                      {post.category || 'その他'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(post.created_at).toLocaleString('ja-JP', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
