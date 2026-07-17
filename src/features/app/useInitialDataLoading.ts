import type { User } from "firebase/auth";
import {
    useEffect,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import {
    loadCategoriesFromFirestore,
    loadExpensesFromFirestore,
    loadProfileFromFirestore,
    saveCategoriesToFirestore,
} from "../../lib/firestoreStorage";
import type { Category } from "../../types/category";
import type { Expense } from "../../types/expense";
import type { Profile } from "../../types/profile";
import { initialCategories } from "../categories/categories";

type UseInitialDataLoadingProps = {
    // 現在ログインしているユーザー
    currentUser: User | null;

    // 読み込んだ支出・収入データを画面へ反映するための関数
    setExpenses: Dispatch<SetStateAction<Expense[]>>;

    // 読み込んだカテゴリーデータを画面へ反映するための関数
    setCategories: Dispatch<SetStateAction<Category[]>>;

    // 読み込んだプロフィール情報を画面へ反映するための関数
    setProfile: Dispatch<SetStateAction<Profile>>;

    // 読み込みに失敗した場合にエラーを表示するための関数
    onError: (message: string) => void;
};

type UseInitialDataLoadingReturn = {
    // Firestoreからデータを読み込み中かどうか
    isFirestoreLoading: boolean;

    // エラー時の再実行にも使用する読み込み関数
    loadDataFromFirestore: () => Promise<void>;
};

export function useInitialDataLoading({
    currentUser,
    setExpenses,
    setCategories,
    setProfile,
    onError,
}: UseInitialDataLoadingProps): UseInitialDataLoadingReturn {
    // Firestoreから家計簿データを読み込み中かどうかを管理
    const [isFirestoreLoading, setIsFirestoreLoading] = useState(false);

    async function loadDataFromFirestore(): Promise<void> {
        // ログイン中のユーザーがまだ取得できていない場合は読み込まない
        if (currentUser === null) {
            return;
        }

        // 前回のエラー表示を削除
        onError("");

        // Firestoreの読み込みを開始する
        setIsFirestoreLoading(true);

        try {
            // ログイン中ユーザー専用のFirestoreデータを読み込む
            const firestoreExpenses = await loadExpensesFromFirestore(
                currentUser.uid
            );
            const firestoreCategories = await loadCategoriesFromFirestore(
                currentUser.uid
            );
            const firestoreProfile = await loadProfileFromFirestore(
                currentUser.uid
            );

            // Firestoreの支出・収入データを画面に反映する
            setExpenses(firestoreExpenses);

            // Firestoreにカテゴリーがない場合は、初期カテゴリーを保存して使う
            if (firestoreCategories.length === 0) {
                setCategories(initialCategories);

                await saveCategoriesToFirestore(
                    currentUser.uid,
                    initialCategories
                );
            } else {
                // Firestoreのカテゴリーデータを画面に反映する
                setCategories(firestoreCategories);
            }

            // Firestoreのプロフィール情報を画面に反映する
            setProfile(firestoreProfile);
        } catch (error) {
            console.error(
                "Firestoreからのデータ読み込みに失敗しました",
                error
            );

            onError(
                "家計簿データの読み込みに失敗しました。通信環境を確認して、もう一度お試しください。"
            );
        } finally {
            setIsFirestoreLoading(false);
        }
    }

    // ログインユーザーが変わったときにFirestoreからデータを読み込む
    useEffect(() => {
        loadDataFromFirestore();
    }, [currentUser]);

    return {
        isFirestoreLoading,
        loadDataFromFirestore,
    };
}