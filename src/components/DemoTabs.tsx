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
      <div className="flex items-center justify-between border-b border-gray-700 shrink-0 px-2">
        <div className="flex">
          <button
            onClick={() => setActiveTab('category')}
            className={`px-6 py-3 text-sm font-bold transition-colors ${
              activeTab === 'category'
                ? 'text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            カテゴリ別
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 text-sm font-bold transition-colors ${
              activeTab === 'list'
                ? 'text-white border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            投稿一覧
          </button>
        </div>
        <div className="pr-4 text-gray-300 text-sm">
          投稿数：<span className="text-white font-bold text-xl">{posts.length}</span> 件
        </div>
      </div>

      {/* カテゴリ別タブ */}
      {activeTab === 'category' && (
        <div className="flex-1 overflow-y-auto p-6">
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
      )}

      {/* 投稿一覧タブ */}
      {activeTab === 'list' && (
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto rounded-lg border border-gray-700">
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
                      <span className={`${getCategoryColor(post.category).badge} text-xs px-2 py-1 rounded-full whitespace-nowrap`}>
                        {post.category}
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
          </div>
        </div>
      )}
    </div>
  )
}
