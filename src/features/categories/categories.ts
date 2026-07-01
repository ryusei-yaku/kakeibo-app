import type { Category } from "../../types/category";

export const initialCategories: Category[] = [
    { id: "expense-food", name: "食費", type: "expense", displayOrder: 1, isDeleted: false },
    { id: "expense-daily", name: "日用品", type: "expense", displayOrder: 2, isDeleted: false },
    { id: "expense-transportation", name: "交通費", type: "expense", displayOrder: 3, isDeleted: false },
    { id: "expense-medical", name: "医療費", type: "expense", displayOrder: 4, isDeleted: false },
    { id: "expense-entertainment", name: "娯楽", type: "expense", displayOrder: 5, isDeleted: false },
    { id: "expense-other", name: "その他", type: "expense", displayOrder: 99, isDeleted: false },

    { id: "income-salary", name: "収入", type: "income", displayOrder: 1, isDeleted: false },
    { id: "income-bonus", name: "賞与", type: "income", displayOrder: 2, isDeleted: false },
    { id: "income-sidejob", name: "副業", type: "income", displayOrder: 3, isDeleted: false },
    { id: "income-pocket-money", name: "お小遣い", type: "income", displayOrder: 4, isDeleted: false },
    { id: "income-other", name: "その他", type: "income", displayOrder: 99, isDeleted: false },
];