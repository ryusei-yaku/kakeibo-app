import type { Category } from "../../types/category";

export const initialCategories: Category[] = [
    { id: "food", name: "食費", isDeleted: false },
    { id: "daily", name: "日用品", isDeleted: false },
    { id: "transportation", name: "交通費", isDeleted: false },
    { id: "medical", name: "医療費", isDeleted: false },
    { id: "entertainment", name: "娯楽", isDeleted: false },
    { id: "other", name: "その他", isDeleted: false },
];