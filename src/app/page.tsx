import PalindromeGenerator from "@/components/PalindromeGenerator";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <main className="container mx-auto px-4 py-12">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            回文メーカー
          </h1>
          <p className="text-lg text-gray-500">
            単語を入力して、回文の候補を見つけよう
          </p>
        </div>

        {/* メインコンテンツ */}
        <PalindromeGenerator />

        {/* フッター */}
        <footer className="mt-16 text-center text-sm text-gray-400">
          <p>
            回文（かいぶん）= 前から読んでも後ろから読んでも同じ文
          </p>
          <p className="mt-1">
            例: 「たけやぶやけた」「しんぶんし」「とまと」
          </p>
        </footer>
      </main>
    </div>
  );
}
