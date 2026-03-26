import QrDisplay from '@/components/QrDisplay'

export default function QrPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">キックオフ 行動宣言</h1>
      <p className="text-gray-500 mb-10 text-lg">QRコードを読み取って投稿してください</p>
      <QrDisplay />
      <p className="mt-8 text-gray-400 text-sm break-all text-center px-4">
        {process.env.NEXT_PUBLIC_APP_URL ?? ''}
      </p>
    </div>
  )
}
