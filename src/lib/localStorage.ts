import type { Category } from "../types/category";
import type { Expense } from "../types/expense";
import { initialCategories } from "../features/categories/categories";

const EXPENSES_STORAGE_KEY = "kakeibo-expenses";
const CATEGORIES_STORAGE_KEY = "kakeibo-categories";

// localStorageから支出データを読み込む
// 保存データがない場合や、読み込みに失敗した場合は空配列を返す
export function loadExpensesFromStorage() {
    try {
        // localStorageに保存されている支出データを取得する
        const savedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);

        // まだ一度も保存されていない場合
        if (savedExpenses === null) {
            return [];
        }

        // localStorageには文字列として保存されているため、配列に戻す
        return JSON.parse(savedExpenses) as Expense[];
    } catch {
        // JSONの形式が壊れている場合など、読み込みに失敗したら初期状態に戻す
        return [];
    }
}

// 支出データをlocalStorageへ保存する
export function saveExpensesToStorage(expenses: Expense[]) {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
}

// localStorageからカテゴリーデータを読み込む
// 保存データがない場合や、読み込みに失敗した場合は初期カテゴリーを返す
export function loadCategoriesFromStorage() {
    try {
        // localStorageに保存されているカテゴリーデータを取得する
        const savedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);

        // まだ一度も保存されていない場合は、初期カテゴリーを使う
        if (savedCategories === null) {
            return initialCategories;
        }

        // localStorageには文字列として保存されているため、配列に戻す
        const parsedCategories = JSON.parse(savedCategories) as Category[];

        // 何らかの理由で空配列が保存されていた場合は、初期カテゴリーを使う
        // 初回表示でカテゴリーが何も出なくなるのを防ぐため
        if (parsedCategories.length === 0) {
            return initialCategories;
        }

        // 古い保存データには isDeleted が存在しない可能性がある
        // その場合は、削除されていないカテゴリーとして扱う
        return parsedCategories.map((category) => ({
            ...category,
            isDeleted: category.isDeleted ?? false,
        }));
    } catch {
        // JSONの形式が壊れている場合など、読み込みに失敗したら初期カテゴリーを使う
        return initialCategories;
    }
}

// カテゴリーデータをlocalStorageへ保存する
export function saveCategoriesToStorage(categories: Category[]) {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
}