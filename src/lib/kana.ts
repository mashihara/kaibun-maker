// カタカナからひらがなへの変換
export function katakanaToHiragana(text: string): string {
  return text.replace(/[\u30A1-\u30F6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

// テキストの正規化（ひらがな化、スペース・記号除去）
export function normalize(text: string): string {
  let normalized = katakanaToHiragana(text);
  normalized = normalized.replace(/[\s　、。！？・ー\-]/g, "");
  return normalized;
}

// ひらがなのみかチェック
export function isHiraganaOnly(text: string): boolean {
  return /^[\u3041-\u3096\u309D-\u309F]+$/.test(text);
}

// 文字列を反転
export function reverseString(text: string): string {
  return [...text].reverse().join("");
}

// 回文判定
export function isPalindrome(text: string): boolean {
  const len = text.length;
  for (let i = 0; i < Math.floor(len / 2); i++) {
    if (text[i] !== text[len - 1 - i]) return false;
  }
  return true;
}
