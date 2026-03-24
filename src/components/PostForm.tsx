'use client'

import { useState, useEffect } from 'react'

const SESSION_KEY = 'kickoff_posted'
const SESSION_ID_KEY = 'kickoff_session_id'

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY)
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem(SESSION_ID_KEY, sessionId)
  }
  return sessionId
}

export default function PostForm() {
  const [text, setText] = useState('')
  const [posted, setPosted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setPosted(true)
    }
  }, [])

  const remaining = 140 - text.length

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    setError('')

    try {
      const sessionId = getOrCreateSessionId()
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sessionId }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? '投稿に失敗しました')
        return
      }

      sessionStorage.setItem(SESSION_KEY, 'true')
      setPosted(true)
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  if (posted) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎉</div>
        <p className="text-2xl font-bold text-gray-800">投稿ありがとうございました！</p>
        <p className="text-gray-500 mt-2">あなたの行動宣言が登録されました。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={140}
          rows={5}
          placeholder="あなたの行動宣言を入力してください..."
          className="w-full border border-gray-300 rounded-lg p-4 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
          disabled={loading}
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-sm ${remaining < 10 ? 'text-red-500' : 'text-gray-400'}`}>
            残り {remaining} 文字
          </span>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={!text.trim() || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        {loading ? '投稿中...' : '投稿する'}
      </button>
    </form>
  )
}
