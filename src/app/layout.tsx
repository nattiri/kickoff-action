import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "キックオフ 行動宣言",
  description: "事業部キックオフ 行動宣言投稿アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
