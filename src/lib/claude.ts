import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function extractKeywords(text: string): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(
      `以下の行動宣言から、ワードクラウド表示用のキーワードを3〜6個抽出してください。
名詞・動詞の体言止めで、短く簡潔に。JSON配列のみを返してください。

行動宣言: 「${text}」

返答例: ["顧客対応", "改善提案", "毎日実践"]`
    )

    const responseText = result.response.text()
    const match = responseText.match(/\[.*?\]/s)
    if (!match) return []

    const keywords = JSON.parse(match[0])
    if (!Array.isArray(keywords)) return []

    return keywords.filter((k): k is string => typeof k === 'string')
  } catch (e) {
    console.error('[Gemini] extractKeywords error:', e)
    return []
  }
}
