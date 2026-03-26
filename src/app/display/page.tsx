import DisplayTabs from '@/components/DisplayTabs'

export default function DisplayPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="py-4 px-6 text-center bg-gray-800 shadow shrink-0">
        <h1 className="text-2xl font-bold tracking-wide">キックオフ 行動宣言</h1>
      </header>

      <main className="flex-1 overflow-hidden">
        <DisplayTabs />
      </main>
    </div>
  )
}
