# kickoff-action

事業部キックオフイベント用の行動宣言投稿・リアルタイムワードクラウド表示アプリ。

## 画面構成

| パス | 説明 | 利用者 |
|---|---|---|
| `/` | 行動宣言投稿フォーム | 参加者（スマホ・PC） |
| `/display` | ワードクラウドリアルタイム表示 | プロジェクター・大画面 |
| `/admin` | 投稿一覧・削除・CSVエクスポート | 運営者 |

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して各値を設定してください。

### 3. Supabase のセットアップ

[Supabase](https://supabase.com) でプロジェクトを作成し、SQL エディタで以下を実行:

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

### 4. 開発サーバーの起動

```bash
npm run dev
```

## Vercel へのデプロイ

1. このリポジトリを GitHub に push
2. [Vercel](https://vercel.com) でリポジトリをインポート
3. 環境変数（`.env.local.example` 参照）を Vercel ダッシュボードで設定
4. デプロイ実行

## 技術スタック

- [Next.js 15](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) — DB + Realtime
- [Anthropic Claude API](https://www.anthropic.com/) — キーワード自動抽出
- [react-wordcloud](https://github.com/chrisrzhou/react-wordcloud) — ワードクラウド描画
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/) — ホスティング
