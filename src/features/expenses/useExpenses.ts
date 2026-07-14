import type { User } from "firebase/auth";
import { useState } from "react";
import {
    deleteExpenseFromFirestore,
    saveExpenseToFirestore,
    updateExpenseToFirestore,
} from "../../lib/firestoreStorage";
import type { Expense } from "../../types/expense";

type UseExpensesProps = {
    // 現在ログインしているユーザー
    currentUser: User | null;

    // Firestore操作に失敗した場合に、画面へエラーを表示するための関数
    onError: (message: string) => void;
};

export function useExpenses({
    currentUser,
    onError,
}: UseExpensesProps) {
    // Firestoreから読み込むまでは、支出・収入データは空で始める
    const [expenses, setExpenses] = useState<Expense[]>([]);

    async function addExpense(expense: Expense) {
        // ログイン中のユーザーがいない場合は保存しない
        if (currentUser === null) {
            return;
        }

        // 先に画面上の支出・収入一覧を更新する
        setExpenses((currentExpenses) => [expense, ...currentExpenses]);

        try {
            // ログイン中ユーザー専用のFirestoreに保存する
            await saveExpenseToFirestore(currentUser.uid, expense);
        } catch (error) {
            console.error("Firestoreへの支出・収入保存に失敗しました", error);

            // Firestore保存に失敗した場合は、画面に追加したデータを元に戻す
            setExpenses((currentExpenses) =>
                currentExpenses.filter(
                    (currentExpense) => currentExpense.id !== expense.id
                )
            );

            onError(
                "保存に失敗しました。通信環境を確認して、もう一度お試しください。"
            );
        }
    }

    async function updateExpense(updatedExpense: Expense) {
        // ログイン中のユーザーがいない場合は、Firestoreに保存できないため何もしない
        if (currentUser === null) {
            return;
        }

        // Firestore更新に失敗した時に元へ戻せるよう、更新前の一覧を保存する
        const previousExpenses = expenses;

        // 先に画面上の支出・収入データを更新する
        setExpenses((currentExpenses) =>
            currentExpenses.map((expense) =>
                expense.id === updatedExpense.id ? updatedExpense : expense
            )
        );

        try {
            // ログイン中ユーザー専用のFirestore上の支出・収入データを更新する
            await updateExpenseToFirestore(currentUser.uid, updatedExpense);
        } catch (error) {
            console.error("Firestoreへの支出・収入更新に失敗しました", error);

            // Firestore更新に失敗した場合は、画面上のデータを更新前に戻す
            setExpenses(previousExpenses);

            onError(
                "更新に失敗しました。通信環境を確認して、もう一度お試しください。"
            );
        }
    }
    async function deleteExpense(expenseId: string) {
        // ログイン中のユーザーがいない場合は、Firestoreから削除できないため何もしない
        if (currentUser === null) {
            return;
        }

        // Firestore削除に失敗したときに元へ戻せるよう、削除前の一覧を保存する
        const previousExpenses = expenses;

        // 先に画面上の支出・収入データを削除する
        setExpenses((currentExpenses) =>
            currentExpenses.filter((expense) => expense.id !== expenseId)
        );

        try {
            // ログイン中ユーザー専用のFirestore上の支出・収入データを削除する
            await deleteExpenseFromFirestore(currentUser.uid, expenseId);
        } catch (error) {
            console.error("Firestoreからの支出・収入削除に失敗しました", error);

            // Firestore削除に失敗した場合は、画面上のデータを削除前に戻す
            setExpenses(previousExpenses);

            onError(
                "削除に失敗しました。通信環境を確認して、もう一度お試しください。"
            );
        }
    }

    return {
        expenses,
        setExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
    };
}