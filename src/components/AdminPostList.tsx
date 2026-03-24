'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, Post } from '@/lib/supabase'

export default function AdminPostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deletingAll, setDeletingAll] = useState(false)

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
      .channel('admin-posts-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => { fetchPosts() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchPosts])

  async function handleDelete(id: string) {
    if (!confirm('この投稿を削除しますか？')) return
    setDeletingId(id)

    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
    }
    setDeletingId(null)
  }

  async function handleDeleteAll() {
    if (!confirm(`全${posts.length}件の投稿を削除しますか？この操作は取り消せません。`)) return
    setDeletingAll(true)
    const res = await fetch('/api/posts', { method: 'DELETE' })
    if (res.ok) setPosts([])
    setDeletingAll(false)
  }

  function handleExport() {
    window.location.href = '/api/export'
  }

  if (loading) {
    return <p className="text-gray-400 text-center py-12">読み込み中...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">投稿一覧（{posts.length} 件）</p>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteAll}
            disabled={deletingAll || posts.length === 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {deletingAll ? '削除中...' : '全件削除'}
          </button>
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            CSVエクスポート
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400 text-center py-12">投稿がありません</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <p className="text-gray-800 mb-2">{post.text}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {post.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleString('ja-JP')}
                  </span>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="text-xs text-red-500 hover:text-red-700 disabled:text-gray-300 transition-colors"
                  >
                    {deletingId === post.id ? '削除中...' : '削除'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
