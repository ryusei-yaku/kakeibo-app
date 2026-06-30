import type { Category } from "../types/category";

// カテゴリー一覧を表示用に並び替える
// 「その他」はよく使うカテゴリーではなく補助的な分類なので、最後に表示する
export function sortCategories(categories: Category[]) {
    return [...categories].sort((a, b) => {
        // 「その他」は最後に表示する
        if (a.id === "other") {
            return 1;
        }

        if (b.id === "other") {
            return -1;
        }

        // 「その他」以外は、元の順番をできるだけ維持する
        return 0;
    });
}