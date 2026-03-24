# kickoff-action

事業部キックオフイベント用の行動宣言投稿・リアルタイム表示アプリ。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **DB / リアルタイム**: Supabase (PostgreSQL + Realtime)
- **AI**: Claude API (claude-haiku-4-5) — キーワード抽出
- **ワードクラウド**: react-wordcloud
- **デプロイ**: Vercel

## ディレクトリ構成

```
src/
├── app/
│   ├── page.tsx              # 投稿画面 /
│   ├── display/page.tsx      # ワードクラウド画面 /display
│   ├── admin/page.tsx        # 管理者画面 /admin
│   └── api/
│       ├── posts/route.ts         # GET(一覧) / POST(投稿作成)
│       ├── posts/[id]/route.ts    # DELETE(削除)
│       └── export/route.ts        # GET(CSVエクスポート)
├── components/
│   ├── PostForm.tsx          # 投稿フォーム
│   ├── WordCloudDisplay.tsx  # ワードクラウド表示
│   └── AdminPostList.tsx     # 管理者投稿一覧
└── lib/
    ├── supabase.ts           # Supabaseクライアント
    └── claude.ts             # Claude APIラッパー
```

## 環境変数

`.env.local.example` を `.env.local` にコピーして各値を設定する。

## Supabase セットアップ

以下のDDLを Supabase の SQL エディタで実行する:

```sql
create table posts (
  id         uuid        primary key default gen_random_uuid(),
  text       text        not null check (char_length(text) <= 140),
  keywords   text[]      not null default '{}',
  created_at timestamptz not null default now(),
  session_id text        not null
);

alter publication supabase_realtime add table posts;

alter table posts enable row level security;

create policy "誰でも投稿を読める" on posts
  for select using (true);

create policy "誰でも投稿できる" on posts
  for insert with check (true);
```

## 開発サーバー起動

```bash
npm run dev
```

## 画面一覧

| パス | 説明 |
|---|---|
| `/` | 参加者用投稿フォーム |
| `/display` | ワードクラウド表示（プロジェクター用） |
| `/admin` | 管理者画面（削除・CSVエクスポート） |
