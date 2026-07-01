import type { Category } from "../types/category";

// カテゴリー一覧を表示用に並び替える
// 「その他」はよく使うカテゴリーではなく補助的な分類なので、最後に表示する
export function sortCategories(categories: Category[]) {
    return [...categories].sort((a, b) => {
        return a.displayOrder - b.displayOrder;
    });
}