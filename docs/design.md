# 設計書

## システム構成

### アーキテクチャ概要

```
[参加者ブラウザ]   [プロジェクター等]   [管理者ブラウザ]
      │                  │                   │
      ▼                  ▼                   ▼
┌────────────────────────────────────────────────┐
│              Next.js (App Router)               │
│                                                │
│  / (投稿画面)  /display (ワードクラウド画面)    │
│  /admin (管理画面・認証なし)                   │
│                                                │
│  /api/posts      POST: 投稿作成                │
│  /api/posts/[id] DELETE: 投稿削除              │
│  /api/export     GET: CSV出力                  │
└──────────────┬──────────────────┬─────────────┘
              │               │
       ┌──────▼──────┐  ┌─────▼─────────┐
       │  Supabase   │  │  Claude API   │
       │  PostgreSQL │  │  (Haiku)      │
       │  Realtime   │  │  キーワード抽出│
       └─────────────┘  └───────────────┘

              Vercel にデプロイ
```

### 採用技術

| レイヤー | 技術 | 採用理由 |
|---|---|---|
| フロントエンド | Next.js 14 (App Router) + TypeScript | SSR対応・Vercelと最適な相性 |
| スタイリング | Tailwind CSS | 迅速なUI構築、レスポンシブ対応 |
| ワードクラウド | react-wordcloud | 実績あり・カスタマイズ容易 |
| DB + リアルタイム | Supabase | PostgreSQL + WebSocketが無料枠で利用可能 |
| AI処理 | Claude API (claude-haiku-4-5) | 低コスト・日本語対応品質 |
| デプロイ | Vercel | Next.jsと最適統合・無料枠あり |

### コスト見積もり

| サービス | 見積もり |
|---|---|
| Vercel | ¥0（Hobby プラン） |
| Supabase | ¥0（Free プラン） |
| Claude API (Haiku) | 約¥5〜10（400投稿 × 約300トークン） |
| **合計** | **ほぼ¥0** |

---

## データベース設計

### テーブル: `posts`

| カラム | 型 | 制約 | 説明 |
|---|---|---|---|
| `id` | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | 投稿ID |
| `text` | text | NOT NULL, char_length <= 140 | 行動宣言本文 |
| `keywords` | text[] | NOT NULL, DEFAULT '{}' | AIが抽出したキーワード |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | 投稿日時 |
| `session_id` | text | NOT NULL | 1人1投稿制御用セッションID |

### DDL

```sql
create table posts (
  id         uuid        primary key default gen_random_uuid(),
  text       text        not null check (char_length(text) <= 140),
  keywords   text[]      not null default '{}',
  created_at timestamptz not null default now(),
  session_id text        not null
);

-- Supabase Realtimeを有効化
alter publication supabase_realtime add table posts;

-- 匿名ユーザーからの読み取りを許可（Row Level Security）
alter table posts enable row level security;

create policy "誰でも投稿を読める" on posts
  for select using (true);

create policy "誰でも投稿できる" on posts
  for insert with check (true);
```

---

## 画面設計

### 画面一覧

| パス | 用途 | 利用者 |
|---|---|---|
| `/` | 投稿画面 | 参加者（スマホ・PC） |
| `/display` | ワードクラウド表示画面 | プロジェクター・大画面 |
| `/admin` | 管理画面（削除・CSV出力） | 運営者 |

---

### ① 投稿画面 `/`

```
┌──────────────────────────────────────┐
│         キックオフ 行動宣言           │  ← ヘッダー
├──────────────────────────────────────┤
│                                      │
│   あなたの行動宣言を投稿してください   │
│                                      │
│   ┌──────────────────────────────┐  │
│   │                              │  │
│   │ テキストエリア（最大140文字）  │  │
│   │                              │  │
│   └──────────────────────────────┘  │
│   残り XX 文字          [投稿する]    │
│                                      │
└──────────────────────────────────────┘

【投稿済み状態】
フォームを非表示にして
「投稿ありがとうございました」メッセージを表示
```

---

### ② ワードクラウド画面 `/display`

プロジェクターや大型モニターでの表示を想定。参加者には URL を共有しない。

```
┌──────────────────────────────────────┐
│         キックオフ 行動宣言           │  ← ヘッダー
│                                      │
│                                      │
│         【ワードクラウド】             │
│         リアルタイム更新              │
│    頻出キーワードが大きく表示される    │
│                                      │
│           投稿数: XX 件              │  ← フッター
└──────────────────────────────────────┘
```

**ワードクラウドの仕様**
- キーワードの出現頻度が高いほど文字が大きく表示
- 新規投稿時にリアルタイムで更新
- 投稿が0件の場合は「まだ投稿がありません」を表示

---

### ③ 管理者画面 `/admin`

認証なし。URLを知っている運営者のみが利用する想定。

```
┌──────────────────────────────────────┐
│  管理者画面         [CSVエクスポート]  │
├──────────────────────────────────────┤
│  投稿一覧（XX 件）                    │
│  ┌──────────────────────────────┐   │
│  │ お客様の声を毎日1件拾い上げ…  │   │
│  │ #顧客対応 #改善 #継続        │   │
│  │ 2026/04/10 10:23   [削除]    │   │
│  ├──────────────────────────────┤   │
│  │ チームの目標を共有し…         │   │
│  │ #チームワーク #目標共有      │   │
│  │ 2026/04/10 10:25   [削除]    │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

---

## API設計

### POST `/api/posts` — 投稿作成

**処理フロー**
1. リクエストボディのバリデーション（text: 1〜140文字、sessionId: 必須）
2. Claude API でキーワード抽出
3. Supabase に保存
4. 保存結果を返却

**リクエスト**
```json
{
  "text": "お客様の声を毎日1件拾い上げ、改善につなげる",
  "sessionId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

**レスポンス**
```json
{
  "id": "uuid",
  "text": "お客様の声を毎日1件拾い上げ、改善につなげる",
  "keywords": ["顧客の声", "改善", "継続"],
  "created_at": "2026-04-10T10:23:00Z"
}
```

---

### DELETE `/api/posts/[id]` — 投稿削除

認証なし。

**レスポンス**
```json
{ "success": true }
```

---

### GET `/api/export` — CSVエクスポート

認証なし。

**レスポンス**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="kickoff-actions-20260410.csv"

id,text,keywords,created_at
uuid,"お客様の声を毎日1件拾い上げ、改善につなげる","顧客の声,改善,継続",2026-04-10T10:23:00Z
...
```

---

## AI処理設計

### モデル

`claude-haiku-4-5-20251001`（低コスト・高速・日本語対応）

### プロンプト

```
以下の行動宣言から、ワードクラウド表示用のキーワードを3〜6個抽出してください。
名詞・動詞の体言止めで、短く簡潔に。JSON配列のみを返してください。

行動宣言: 「{text}」

返答例: ["顧客対応", "改善提案", "毎日実践"]
```

### エラー時のフォールバック

Claude API呼び出しが失敗した場合は、キーワードなし（空配列）で投稿を保存し、処理を継続する。

---

## 1人1投稿の制御方式

- 投稿フォームの送信時に `crypto.randomUUID()` でセッションIDを生成
- 生成したセッションIDを `sessionStorage` に保存
- ページ表示時に `sessionStorage` を確認し、投稿済みならフォームを非表示
- セッションIDはサーバーサイドでは重複チェックに使用しない（簡易制御）

> **注意:** ブラウザのシークレットモード切替や `sessionStorage` クリアで回避可能。イベント利用の性質上、この制御レベルで十分と判断。

---

## ディレクトリ構成

```
kickoff-action/
├── docs/
│   ├── requirements.md       # 要件定義書
│   └── design.md             # 設計書
├── src/
│   ├── app/
│   │   ├── layout.tsx        # 共通レイアウト
│   │   ├── page.tsx          # 投稿画面 /
│   │   ├── display/
│   │   │   └── page.tsx      # ワードクラウド画面 /display
│   │   ├── admin/
│   │   │   └── page.tsx      # 管理者画面 /admin
│   │   └── api/
│   │       ├── posts/
│   │       │   ├── route.ts        # POST: 投稿作成
│   │       │   └── [id]/route.ts   # DELETE: 投稿削除
│   │       └── export/
│   │           └── route.ts        # GET: CSVエクスポート
│   ├── components/
│   │   ├── WordCloud.tsx     # ワードクラウドコンポーネント
│   │   ├── PostForm.tsx      # 投稿フォームコンポーネント
│   │   └── AdminPostList.tsx # 管理者投稿一覧コンポーネント
│   └── lib/
│       ├── supabase.ts       # Supabaseクライアント初期化
│       └── claude.ts         # Claude APIラッパー
├── .env.local                # 環境変数（gitignore対象）
├── .env.local.example        # 環境変数テンプレート
├── CLAUDE.md                 # プロジェクト情報
├── package.json
└── README.md                 # セットアップ手順
```

---

## 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # サーバーサイドのみ（削除・エクスポートAPI）

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

---

## デプロイ手順

1. **Supabase**
   - プロジェクト作成
   - DDLを実行してテーブル作成
   - Realtimeを有効化

2. **Anthropic**
   - APIキーを発行

3. **Vercel**
   - GitHubリポジトリと連携
   - 環境変数を設定
   - デプロイ実行

4. **動作確認**
   - `/` で投稿 → `/display` のワードクラウドがリアルタイム更新されることを確認
   - `/admin` で投稿削除・CSVエクスポートの確認
