import AdminPostList from '@/components/AdminPostList'

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white py-4 px-6 shadow">
        <h1 className="text-xl font-bold">管理者画面</h1>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <AdminPostList />
      </main>
    </div>
  )
}
