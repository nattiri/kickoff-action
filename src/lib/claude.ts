import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function extractKeywords(text: string): Promise<string[]> {
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `以下の行動宣言から、ワードクラウド表示用のキーワードを3〜6個抽出してください。
名詞・動詞の体言止めで、短く簡潔に。JSON配列のみを返してください。

行動宣言: 「${text}」

返答例: ["顧客対応", "改善提案", "毎日実践"]`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') return []

    const match = content.text.match(/\[.*?\]/s)
    if (!match) return []

    const keywords = JSON.parse(match[0])
    if (!Array.isArray(keywords)) return []

    return keywords.filter((k): k is string => typeof k === 'string')
  } catch (e) {
    console.error('[Claude] extractKeywords error:', e)
    return []
  }
}
