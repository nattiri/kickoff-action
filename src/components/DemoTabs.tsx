'use client'

import { useState, useMemo } from 'react'
import { generateMockPosts } from '@/lib/mockData'
import { Post } from '@/lib/supabase'
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

type Tab = 'category' | 'list'

export default function DemoTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('category')
  const posts = useMemo(() => generateMockPosts(380), [])
  const grouped = useMemo(() => groupByCategory(posts), [posts])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-white/10 shrink-0 px-2 bg-white/5">
        <div className="flex">
          <button
            onClick={() => setActiveTab('category')}
            className={`px-6 py-3 text-sm font-bold transition-colors ${
              activeTab === 'category'
                ? 'text-white border-b-2 border-blue-400'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            カテゴリ別
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 text-sm font-bold transition-colors ${
              activeTab === 'list'
                ? 'text-white border-b-2 border-blue-400'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            投稿一覧
          </button>
        </div>
        <div className="pr-4 text-white/60 text-sm flex items-center gap-1">
          投稿数：<span className="text-white font-bold text-2xl tabular-nums">{posts.length}</span> 件
        </div>
      </div>

      {/* カテゴリ別タブ */}
      {activeTab === 'category' && (
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hover">
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
                      <li key={post.id} className="px-4 py-3 text-white/90 text-sm leading-relaxed">
                        {post.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 投稿一覧タブ */}
      {activeTab === 'list' && (
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 scrollbar-hover">
            <table className="w-full text-sm">
              <thead className="bg-white/10 text-white/80 sticky top-0 backdrop-blur-sm">
                <tr>
                  <th className="text-left px-4 py-3 w-1/2">投稿テキスト</th>
                  <th className="text-left px-4 py-3 w-1/6">カテゴリ</th>
                  <th className="text-left px-4 py-3 w-1/4">投稿時刻</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {posts.map((post) => (
                  <tr key={post.id} className="text-white/80 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 leading-relaxed">{post.text}</td>
                    <td className="px-4 py-3">
                      <span className={`${getCategoryColor(post.category).badge} text-xs px-2 py-1 rounded-full whitespace-nowrap`}>
                        {post.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/40 whitespace-nowrap">
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
          </div>
        </div>
      )}
    </div>
  )
}
