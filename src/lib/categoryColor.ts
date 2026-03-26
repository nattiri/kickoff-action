const COLORS = [
  { bg: 'bg-blue-600',   text: 'text-white',  badge: 'bg-blue-800 text-blue-200' },
  { bg: 'bg-purple-600', text: 'text-white',  badge: 'bg-purple-800 text-purple-200' },
  { bg: 'bg-green-600',  text: 'text-white',  badge: 'bg-green-800 text-green-200' },
  { bg: 'bg-orange-500', text: 'text-white',  badge: 'bg-orange-700 text-orange-200' },
  { bg: 'bg-pink-600',   text: 'text-white',  badge: 'bg-pink-800 text-pink-200' },
  { bg: 'bg-teal-600',   text: 'text-white',  badge: 'bg-teal-800 text-teal-200' },
  { bg: 'bg-indigo-600', text: 'text-white',  badge: 'bg-indigo-800 text-indigo-200' },
  { bg: 'bg-red-600',    text: 'text-white',  badge: 'bg-red-800 text-red-200' },
  { bg: 'bg-yellow-500', text: 'text-white',  badge: 'bg-yellow-700 text-yellow-200' },
  { bg: 'bg-cyan-600',   text: 'text-white',  badge: 'bg-cyan-800 text-cyan-200' },
]

export function getCategoryColor(category: string) {
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}
