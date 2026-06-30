// 金額文字列をカンマ付き表示に変換する
// 例: "1200" → "1,200"
export function formatAmount(value: string) {
    if (value === "") {
        return "";
    }

    return Number(value).toLocaleString();
}