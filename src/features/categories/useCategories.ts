import {
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import type { User } from "firebase/auth";
import {
    saveCategoryToFirestore,
    softDeleteCategoryToFirestore,
    updateCategoryToFirestore,
    updateExpenseCategoryNameToFirestore,
} from "../../lib/firestoreStorage";
import type { Category } from "../../types/category";
import type { Expense } from "../../types/expense";
import { sortCategories } from "../../utils/sortCategories";
import { initialCategories } from "./categories";

type UseCategoriesProps = {
    // 現在ログインしているユーザー
    currentUser: User | null;

    // カテゴリー名変更時に、支出・収入データも更新するための一覧
    expenses: Expense[];

    // 支出・収入データを更新するための関数
    setExpenses: Dispatch<SetStateAction<Expense[]>>;

    // Firestore操作に失敗した場合にエラーを表示するための関数
    onError: (message: string) => void;
};

export function useCategories({
    currentUser,
    expenses,
    setExpenses,
    onError,
}: UseCategoriesProps) {
    // Firestoreから読み込むまでは、初期カテゴリーを表示する
    const [categories, setCategories] =
        useState<Category[]>(initialCategories);

    function createNextCategoryDisplayOrder(
        categoryType: "expense" | "income"
    ) {
        // 同じ種類で、削除されていないカテゴリーを取り出す
        const sameTypeCategories = categories.filter(
            (category) =>
                category.type === categoryType &&
                !category.isDeleted
        );

        // 「その他」はdisplayOrderを99にしているため、
        // 新しいカテゴリーは「その他」よりも前に追加する
        const normalCategories = sameTypeCategories.filter(
            (category) => category.displayOrder < 99
        );

        // 通常カテゴリーがない場合は1から始める
        if (normalCategories.length === 0) {
            return 1;
        }

        // 既存カテゴリーの最大displayOrderの次の番号を渡す
        const maxDisplayOrder = Math.max(
            ...normalCategories.map(
                (category) => category.displayOrder
            )
        );

        return maxDisplayOrder + 1;
    }

    async function addCategory(
        categoryName: string,
        categoryType: "expense" | "income",
    ) {
        // ログイン中のユーザーがいない場合は保存しない
        if (currentUser === null) {
            return;
        }

        // 同じ名前の削除済みカテゴリーがある場合は、
        // 新規作成せずに復活させる
        const deletedCategory = categories.find(
            (category) =>
                category.name === categoryName &&
                category.type === categoryType &&
                category.isDeleted
        );

        if (deletedCategory) {
            // Firestore保存に失敗した場合に戻せるよう、変更前の一覧を保存する
            const previousCategories = categories;

            const restoredCategory: Category = {
                ...deletedCategory,
                isDeleted: false,
            };

            // 先に画面上のカテゴリーを復活させる
            setCategories((currentCategories) =>
                currentCategories.map((category) =>
                    category.id === restoredCategory.id
                        ? restoredCategory
                        : category
                )
            );

            try {
                // ログイン中のユーザー専用のFirestoreに保存する
                await saveCategoryToFirestore(
                    currentUser.uid,
                    restoredCategory
                );
            } catch (error) {
                console.error(
                    "Firestoreへのカテゴリー復活保存に失敗しました",
                    error
                );

                // 保存に失敗した場合は画面上の一覧を元に戻す
                setCategories(previousCategories);

                onError(
                    "カテゴリーの保存に失敗しました。通信環境を確認して、もう一度お試しください。"
                );
            }

            return;
        }

        // Firestore保存に失敗した場合に戻せるよう、追加前の一覧を保存する
        const previousCategories = categories;

        const newCategory: Category = {
            id: crypto.randomUUID(),
            name: categoryName,
            type: categoryType,
            displayOrder:
                createNextCategoryDisplayOrder(categoryType),
            isDeleted: false,
        };

        // 先に画面上へ新しいカテゴリーを追加する
        setCategories((currentCategories) => [
            ...currentCategories,
            newCategory,
        ]);

        try {
            // ログイン中ユーザー専用のFirestoreに保存する
            await saveCategoryToFirestore(
                currentUser.uid,
                newCategory
            );
        } catch (error) {
            console.error(
                "Firestoreへのカテゴリー保存に失敗しました",
                error
            );

            // 保存に失敗した場合は追加前の一覧へ戻す
            setCategories(previousCategories);

            onError(
                "カテゴリーの保存に失敗しました。通信環境を確認して、もう一度お試しください。"
            );
        }
    }

    async function updateCategory(
        categoryId: string,
        categoryName: string
    ) {
        // ログイン中のユーザーがいない場合は保存しない
        if (currentUser === null) {
            return;
        }

        // Firestore更新に失敗した場合に戻せるよう、
        // カテゴリーと支出・収入データを保存する
        const previousCategories = categories;
        const previousExpenses = expenses;

        // 更新対象のカテゴリーを探す
        const updatedCategory = categories.find(
            (category) => category.id === categoryId
        );

        // 対象が見つからない場合は何もしない
        if (!updatedCategory) {
            return;
        }

        const renamedCategory: Category = {
            ...updatedCategory,
            name: categoryName,
        };

        // 先に画面上のカテゴリー名を変更する
        setCategories((currentCategories) =>
            currentCategories.map((category) =>
                category.id === categoryId
                    ? renamedCategory
                    : category
            )
        );


        // 過去に登録した支出・収入データのカテゴリー名も変更する
        setExpenses((currentExpenses) =>
            currentExpenses.map((expense) =>
                expense.categoryId === categoryId
                    ? {
                        ...expense,
                        categoryName,
                    }
                    : expense
            )
        );

        try {
            // Firestore上のカテゴリー名を更新する
            await updateCategoryToFirestore(
                currentUser.uid,
                renamedCategory
            );

            // Firestore上の過去データのカテゴリー名も更新する
            await updateExpenseCategoryNameToFirestore(
                currentUser.uid,
                categoryId,
                categoryName
            );
        } catch (error) {
            console.error(
                "Firestoreへのカテゴリー更新に失敗しました",
                error
            );

            // 更新に失敗した場合は画面上のデータを元に戻す
            setCategories(previousCategories);
            setExpenses(previousExpenses);

            onError(
                "カテゴリーの更新に失敗しました。通信環境を確認して、もう一度お試しください。"
            );
        }
    }

    async function deleteCategory(categoryId: string) {
        // ログイン中のユーザーがいない場合は保存しない
        if (currentUser === null) {
            return;
        }

        // Firestore更新に失敗した場合に戻せるよう、変更前の一覧を保存する
        const previousCategories = categories;

        // 削除対象のカテゴリーを探す
        const deleteTargetCategory = categories.find(
            (category) => category.id === categoryId
        );

        // 対象が見つからない場合は何もしない
        if (!deleteTargetCategory) {
            return;
        }

        const deletedCategory: Category = {
            ...deleteTargetCategory,
            isDeleted: true,
        };

        // 先に画面上のカテゴリーを削除済みにする
        setCategories((currentCategories) =>
            currentCategories.map((category) =>
                category.id === categoryId
                    ? deletedCategory
                    : category
            )
        );

        try {
            // Firestore上のカテゴリーを削除済みにする
            await softDeleteCategoryToFirestore(
                currentUser.uid,
                deletedCategory
            );
        } catch (error) {
            console.error(
                "Firestoreへのカテゴリー削除反映に失敗しました",
                error
            );

            // 更新に失敗した場合は変更前の一覧へ戻す
            setCategories(previousCategories);

            onError(
                "カテゴリーの削除に失敗しました。通信環境を確認して、もう一度お試しください。"
            );
        }
    }

    // 削除されていないカテゴリーだけを画面表示用に並び替える
    const activeCategories = sortCategories(
        categories.filter(
            (category) => !category.isDeleted
        )
    );

    // 削除済みを含むすべてのカテゴリーを並び替える
    // 「その他」は最後に表示する
    const sortedCategories = sortCategories(categories);

    return {
        categories,
        setCategories,
        activeCategories,
        sortedCategories,
        addCategory,
        updateCategory,
        deleteCategory,
    };
}