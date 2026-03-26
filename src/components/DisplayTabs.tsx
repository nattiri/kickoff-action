'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import WordCloudDisplay from './WordCloudDisplay'
import PostListDisplay from './PostListDisplay'

type Tab = 'category' | 'list'

export default function DisplayTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('category')
  const [count, setCount] = useState(0)

  const fetchCount = useCallback(async () => {
    const { count: c } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
    if (c !== null) setCount(c)
  }, [])

  useEffect(() => {
    fetchCount()
    const channel = supabase
      .channel('count-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchCount()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchCount])

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
          投稿数：<span className="text-white font-bold text-xl">{count}</span> 件
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'category' ? <WordCloudDisplay /> : <PostListDisplay />}
      </div>
    </div>
  )
}
