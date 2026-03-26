'use client'

import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'

const MILESTONE_INTERVAL = Math.max(
  1,
  parseInt(process.env.NEXT_PUBLIC_MILESTONE_INTERVAL ?? '50', 10) || 50
)

export default function MilestoneCelebration({ count }: { count: number }) {
  const [milestone, setMilestone] = useState<number | null>(null)
  const prevCount = useRef(0)

  useEffect(() => {
    if (count === 0) {
      prevCount.current = 0
      return
    }
    const prevMilestone = Math.floor(prevCount.current / MILESTONE_INTERVAL)
    const currentMilestone = Math.floor(count / MILESTONE_INTERVAL)
    if (currentMilestone > prevMilestone) {
      const reached = currentMilestone * MILESTONE_INTERVAL
      setMilestone(reached)

      confetti({ particleCount: 160, spread: 80, origin: { x: 0.5, y: 0.55 } })
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { x: 0.2, y: 0.6 } })
      }, 250)
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { x: 0.8, y: 0.6 } })
      }, 500)

      setTimeout(() => setMilestone(null), 4000)
    }
    prevCount.current = count
  }, [count])

  if (milestone === null) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="animate-milestone bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-black font-black px-14 py-8 rounded-3xl shadow-2xl text-center">
        <div className="text-6xl mb-2">🎉</div>
        <div className="text-5xl tracking-tight">{milestone}件達成！</div>
      </div>
    </div>
  )
}
