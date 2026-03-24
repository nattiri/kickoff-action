import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function extractKeywords(text: string): Promise<{ category: string; keywords: string[] }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(
      `以下の行動宣言を分析して、カテゴリと主要キーワードを抽出してください。
以下のJSON形式のみを返してください。

行動宣言: 「${text}」

返答形式:
{"category": "カテゴリ名（4〜10文字）", "keywords": ["キーワード1", "キーワード2", "キーワード3"]}

カテゴリ例: "顧客対応", "業務改善", "チームワーク", "目標達成", "スキルアップ", "情報共有"`
    )

    const responseText = result.response.text()
    const match = responseText.match(/\{.*?\}/s)
    if (!match) return { category: 'その他', keywords: [] }

    const parsed = JSON.parse(match[0])
    return {
      category: typeof parsed.category === 'string' ? parsed.category : 'その他',
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.filter((k: unknown): k is string => typeof k === 'string')
        : [],
    }
  } catch (e) {
    console.error('[Gemini] extractKeywords error:', e)
    return { category: 'その他', keywords: [] }
  }
}
