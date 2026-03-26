import DemoTabs from '@/components/DemoTabs'

export default function DemoPage() {
  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <header className="py-4 px-6 bg-gray-800 shadow shrink-0 flex items-center justify-center gap-3">
        <h1 className="text-2xl font-bold tracking-wide">キックオフ 行動宣言</h1>
        <span className="text-xs bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full">
          DEMO
        </span>
      </header>

      <main className="flex-1 overflow-hidden">
        <DemoTabs />
      </main>
    </div>
  )
}
