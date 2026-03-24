import PostForm from '@/components/PostForm'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-700 text-white py-5 px-6 text-center shadow">
        <h1 className="text-2xl font-bold tracking-wide">キックオフ 行動宣言</h1>
        <p className="text-blue-200 text-sm mt-1">あなたの行動宣言を投稿してください</p>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-8">
          <PostForm />
        </div>
      </main>
    </div>
  )
}
