import DisplayTabs from '@/components/DisplayTabs'

export default function DisplayPage() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <header className="py-4 px-6 text-center bg-white/5 backdrop-blur-sm border-b border-white/10 shadow shrink-0">
        <h1 className="text-2xl font-bold tracking-widest bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
          キックオフ 行動宣言
        </h1>
      </header>

      <main className="flex-1 overflow-hidden">
        <DisplayTabs />
      </main>
    </div>
  )
}
