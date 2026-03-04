import { normalize, isHiraganaOnly, reverseString, isPalindrome } from "./kana";
import { DICTIONARY } from "./dictionary";

export interface HighlightSegment {
  text: string;
  isWord: boolean;
}

// 回文テキスト内の辞書単語（2文字以上）を検出してハイライト用セグメントに分割
export function highlightDictionaryWords(text: string): HighlightSegment[] {
  const dictSet = new Set(DICTIONARY.filter((w) => w.length >= 2));
  // 辞書内の最大単語長
  const maxLen = Math.max(...[...dictSet].map((w) => w.length));

  // 各位置でマッチしたかどうかを管理
  const matched = new Array(text.length).fill(false);
  const matches: { start: number; end: number }[] = [];

  // 長い単語を優先してマッチ
  for (let len = maxLen; len >= 2; len--) {
    for (let i = 0; i <= text.length - len; i++) {
      // すでにマッチ済みの位置を含む場合はスキップ
      let overlap = false;
      for (let j = i; j < i + len; j++) {
        if (matched[j]) {
          overlap = true;
          break;
        }
      }
      if (overlap) continue;

      const substr = text.slice(i, i + len);
      if (dictSet.has(substr)) {
        matches.push({ start: i, end: i + len });
        for (let j = i; j < i + len; j++) {
          matched[j] = true;
        }
      }
    }
  }

  // 位置順にソート
  matches.sort((a, b) => a.start - b.start);

  // セグメントに分割
  const segments: HighlightSegment[] = [];
  let pos = 0;
  for (const m of matches) {
    if (pos < m.start) {
      segments.push({ text: text.slice(pos, m.start), isWord: false });
    }
    segments.push({ text: text.slice(m.start, m.end), isWord: true });
    pos = m.end;
  }
  if (pos < text.length) {
    segments.push({ text: text.slice(pos), isWord: false });
  }

  return segments;
}

export interface PalindromeResult {
  text: string;
  category: "self" | "reverse" | "dictionary" | "sandwich";
  description: string;
}

// 辞書単語から回文になる中間文字列を生成
function generatePalindromicMiddles(): string[] {
  const middles = new Set<string>();

  for (const word of DICTIONARY) {
    // 単語自体が回文なら中間語として使える
    if (isPalindrome(word) && word.length >= 1) {
      middles.add(word);
    }

    // 単語 + reverse(単語) のオーバーラップで回文の中間語を生成
    // 例: "やぶ" → reverse="ぶや" → overlap 0: "やぶぶや", overlap 1(ぶ=ぶ): "やぶや"
    const reversed = reverseString(word);
    for (let k = 1; k < word.length; k++) {
      const wSuffix = word.slice(word.length - k);
      const rPrefix = reversed.slice(0, k);
      if (wSuffix === rPrefix) {
        const candidate = word + reversed.slice(k);
        if (isPalindrome(candidate) && candidate.length >= 2) {
          middles.add(candidate);
        }
      }
    }

    // reverse(単語) + 単語 のオーバーラップ
    for (let k = 1; k < word.length; k++) {
      const rSuffix = reversed.slice(reversed.length - k);
      const wPrefix = word.slice(0, k);
      if (rSuffix === wPrefix) {
        const candidate = reversed + word.slice(k);
        if (isPalindrome(candidate) && candidate.length >= 2) {
          middles.add(candidate);
        }
      }
    }
  }

  return [...middles];
}

// 回文の中間語をキャッシュ
let cachedMiddles: string[] | null = null;

function getPalindromicMiddles(): string[] {
  if (!cachedMiddles) {
    cachedMiddles = generatePalindromicMiddles();
  }
  return cachedMiddles;
}

export function generatePalindromes(input: string): {
  normalized: string;
  reversed: string;
  isInputPalindrome: boolean;
  isValidInput: boolean;
  results: PalindromeResult[];
} {
  const normalized = normalize(input);
  const reversed = reverseString(normalized);

  if (!normalized) {
    return {
      normalized: "",
      reversed: "",
      isInputPalindrome: false,
      isValidInput: false,
      results: [],
    };
  }

  if (!isHiraganaOnly(normalized)) {
    return {
      normalized,
      reversed,
      isInputPalindrome: false,
      isValidInput: false,
      results: [],
    };
  }

  const results: PalindromeResult[] = [];
  const seen = new Set<string>();
  const isInputPal = isPalindrome(normalized);

  const addResult = (
    text: string,
    category: PalindromeResult["category"],
    description: string
  ): boolean => {
    if (!seen.has(text) && text.length > 1 && text !== normalized) {
      seen.add(text);
      results.push({ text, category, description });
      return true;
    }
    return false;
  };

  // 1. 反転結合（オーバーラップあり）
  // overlap = 0: そのまま結合
  addResult(
    normalized + reversed,
    "reverse",
    `「${normalized}」+「${reversed}」`
  );

  // overlap = k: 末尾k文字と先頭k文字が一致する場合、重ねて結合
  for (let k = 1; k < normalized.length; k++) {
    const wSuffix = normalized.slice(normalized.length - k);
    const rPrefix = reversed.slice(0, k);
    if (wSuffix === rPrefix) {
      const candidate = normalized + reversed.slice(k);
      if (isPalindrome(candidate)) {
        addResult(candidate, "reverse", `末尾${k}文字を重ねて結合`);
      }
    }
  }

  // 2. 辞書単語との直接組み合わせ
  for (const word of DICTIONARY) {
    if (word === normalized) continue;

    // input + word
    const concat1 = normalized + word;
    if (isPalindrome(concat1)) {
      addResult(concat1, "dictionary", `「${normalized}」+「${word}」`);
    }

    // word + input
    const concat2 = word + normalized;
    if (isPalindrome(concat2)) {
      addResult(concat2, "dictionary", `「${word}」+「${normalized}」`);
    }
  }

  // 3. 辞書単語ペアとの組み合わせ（D1 + input + D2 が回文）
  // パフォーマンスのため、短い単語に限定
  const shortWords = DICTIONARY.filter((w) => w.length <= 3);
  for (const d1 of shortWords) {
    for (const d2 of shortWords) {
      const candidate = d1 + normalized + d2;
      if (isPalindrome(candidate) && candidate.length <= 12) {
        addResult(
          candidate,
          "dictionary",
          `「${d1}」+「${normalized}」+「${d2}」`
        );
      }
    }
  }

  // 4. サンドイッチ型: W + 回文中間語 + reverse(W)
  const middles = getPalindromicMiddles();
  for (const middle of middles) {
    // 長すぎる結果は除外
    const candidateLen = normalized.length * 2 + middle.length;
    if (candidateLen > 15) continue;

    const candidate = normalized + middle + reversed;
    addResult(candidate, "sandwich", `「${normalized}」+「${middle}」+「${reversed}」`);
  }

  // 結果をソート: 短い順、同じ長さならカテゴリ優先度順
  const categoryOrder = { self: 0, reverse: 1, dictionary: 2, sandwich: 3 };
  results.sort((a, b) => {
    const lenDiff = a.text.length - b.text.length;
    if (lenDiff !== 0) return lenDiff;
    return categoryOrder[a.category] - categoryOrder[b.category];
  });

  return {
    normalized,
    reversed,
    isInputPalindrome: isInputPal,
    isValidInput: true,
    results,
  };
}
