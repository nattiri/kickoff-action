import WordCloudDisplay from '@/components/WordCloudDisplay'

export default function DisplayPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="py-4 px-6 text-center bg-gray-800 shadow">
        <h1 className="text-2xl font-bold tracking-wide">キックオフ 行動宣言</h1>
      </header>

      <main className="flex-1 p-4">
        <WordCloudDisplay />
      </main>

      <footer className="py-2 px-6 text-center text-gray-500 text-sm bg-gray-800">
        リアルタイム更新中
      </footer>
    </div>
  )
}
