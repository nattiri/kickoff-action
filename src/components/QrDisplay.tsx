'use client'

import { QRCodeSVG } from 'qrcode.react'

export default function QrDisplay() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin

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
