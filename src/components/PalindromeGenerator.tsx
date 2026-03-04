"use client";

import { useState, useCallback } from "react";
import { generatePalindromes, PalindromeResult } from "@/lib/palindrome";

const categoryLabel: Record<PalindromeResult["category"], string> = {
  self: "入力そのもの",
  reverse: "反転結合",
  dictionary: "辞書マッチ",
  sandwich: "サンドイッチ型",
};

const categoryColor: Record<PalindromeResult["category"], string> = {
  self: "bg-green-100 text-green-800",
  reverse: "bg-blue-100 text-blue-800",
  dictionary: "bg-purple-100 text-purple-800",
  sandwich: "bg-orange-100 text-orange-800",
};

export default function PalindromeGenerator() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{
    normalized: string;
    reversed: string;
    isInputPalindrome: boolean;
    isValidInput: boolean;
    results: PalindromeResult[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!input.trim()) return;

    setIsGenerating(true);

    // 非同期的に実行してUIをブロックしない
    requestAnimationFrame(() => {
      const result = generatePalindromes(input.trim());
      setResults(result);
      setIsGenerating(false);
    });
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGenerate();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 入力フォーム */}
      <div className="mb-8">
        <label
          htmlFor="word-input"
          className="block text-sm font-medium text-gray-600 mb-2"
        >
          ひらがな（またはカタカナ）で単語を入力してください
        </label>
        <div className="flex gap-3">
          <input
            id="word-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例: たけ、しんぶん、とまと"
            className="flex-1 px-4 py-3 text-lg border-2 border-gray-200 rounded-xl
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                       outline-none transition-all placeholder:text-gray-300"
          />
          <button
            onClick={handleGenerate}
            disabled={!input.trim() || isGenerating}
            className="px-6 py-3 bg-indigo-600 text-white text-lg font-medium rounded-xl
                       hover:bg-indigo-700 active:bg-indigo-800
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       transition-colors"
          >
            {isGenerating ? "生成中..." : "生成"}
          </button>
        </div>
      </div>

      {/* 結果表示 */}
      {results && (
        <div className="space-y-6">
          {/* 入力情報 */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm font-medium w-20">
                入力:
              </span>
              <span className="text-xl font-bold tracking-wider">
                {results.normalized}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm font-medium w-20">
                反転:
              </span>
              <span className="text-xl font-bold tracking-wider text-indigo-600">
                {results.reversed}
              </span>
            </div>
            {!results.isValidInput && (
              <p className="text-red-500 text-sm mt-2">
                ひらがな（またはカタカナ）のみ入力してください。
                漢字やアルファベットには対応していません。
              </p>
            )}
            {results.isInputPalindrome && (
              <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <span className="text-green-700 font-medium">
                  入力「{results.normalized}」自体が回文です！
                </span>
              </div>
            )}
          </div>

          {/* 回文候補 */}
          {results.isValidInput && results.results.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                見つかった回文
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({results.results.length}件)
                </span>
              </h2>
              <div className="space-y-2">
                {results.results.map((result, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-100 rounded-xl p-4
                               hover:shadow-md transition-shadow cursor-default"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xl font-bold tracking-widest text-gray-900 break-all">
                          {result.text}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {result.description}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                          categoryColor[result.category]
                        }`}
                      >
                        {categoryLabel[result.category]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 結果なしの場合 */}
          {results.isValidInput && results.results.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-lg">回文候補が見つかりませんでした</p>
              <p className="text-sm mt-2">
                別の単語を試してみてください
              </p>
            </div>
          )}

          {/* ヒント */}
          {results.isValidInput && (
            <div className="bg-indigo-50 rounded-xl p-5">
              <h3 className="text-sm font-bold text-indigo-800 mb-2">
                ヒント
              </h3>
              <p className="text-sm text-indigo-700">
                「<span className="font-bold">{results.normalized}</span>」+
                （回文の文字列）+「
                <span className="font-bold">{results.reversed}</span>
                」の形で、常に回文を作ることができます。
              </p>
              <p className="text-sm text-indigo-600 mt-1">
                例: {results.normalized}
                <span className="underline">○○○</span>
                {results.reversed}
                （○○○が回文なら全体も回文に！）
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
