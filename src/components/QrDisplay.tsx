'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QrDisplay() {
  const [url, setUrl] = useState(process.env.NEXT_PUBLIC_APP_URL ?? '')

  useEffect(() => {
    if (!url) setUrl(window.location.origin)
  }, [url])

  if (!url) return null

  return (
    <div className="p-6 bg-white rounded-3xl shadow-2xl border border-gray-100">
      <QRCodeSVG
        value={url}
        size={320}
        level="M"
        includeMargin={true}
      />
    </div>
  )
}
