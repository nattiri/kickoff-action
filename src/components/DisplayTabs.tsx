'use client'

import { useState } from 'react'
import WordCloudDisplay from './WordCloudDisplay'
import PostListDisplay from './PostListDisplay'

type Tab = 'category' | 'list'

export default function DisplayTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('category')

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-700 shrink-0">
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

      <div className="flex-1 overflow-hidden">
        {activeTab === 'category' ? <WordCloudDisplay /> : <PostListDisplay />}
      </div>
    </div>
  )
}
