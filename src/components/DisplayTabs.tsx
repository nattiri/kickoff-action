'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import WordCloudDisplay from './WordCloudDisplay'
import PostListDisplay from './PostListDisplay'

type Tab = 'category' | 'list'

function useAnimatedCount(target: number) {
  const [display, setDisplay] = useState(target)
  const prev = useRef(target)

  useEffect(() => {
    if (target === prev.current) return
    const diff = target - prev.current
    const steps = Math.min(Math.abs(diff), 20)
    const interval = 30
    let step = 0
    const timer = setInterval(() => {
      step++
      setDisplay(Math.round(prev.current + (diff * step) / steps))
      if (step >= steps) {
        clearInterval(timer)
        prev.current = target
      }
    }, interval)
    return () => clearInterval(timer)
  }, [target])

  return display
}

export default function DisplayTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('category')
  const [count, setCount] = useState(0)
  const [countKey, setCountKey] = useState(0)
  const animatedCount = useAnimatedCount(count)

  const fetchCount = useCallback(async () => {
    const { count: c } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
    if (c !== null) {
      setCount(c)
      setCountKey(k => k + 1)
    }
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
          投稿数：
          <span
            key={countKey}
            className="text-white font-bold text-2xl tabular-nums animate-count-up"
          >
            {animatedCount}
          </span>
          <span className="text-white/60"> 件</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'category' ? <WordCloudDisplay /> : <PostListDisplay />}
      </div>
    </div>
  )
}
