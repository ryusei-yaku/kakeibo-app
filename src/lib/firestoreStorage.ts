import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Expense } from "../types/expense";

// Firestore上で支出データを保存するコレクション名
// 今はログイン機能がないため、仮のユーザーID配下に保存する
const TEST_USER_ID = "test-user";

// Firestoreに支出データを1件保存する
// まずは動作確認用として、localStorageとは別にFirestoreへ保存できる形を作る
export async function saveExpenseToFirestore(expense: Expense) {
    // 保存先のパスを作る
    // 例: users / test-user / expenses / 支出ID
    const expenseRef = doc(
        collection(db, "users", TEST_USER_ID, "expenses"),
        expense.id
    );

    // Firestoreに支出データを保存する
    // setDoc は、指定したIDのドキュメントを作成または上書きする
    await setDoc(expenseRef, expense);
}

// Firestore上の支出データを更新する
// 今回は追加と同じく setDoc を使い、同じIDのドキュメントを上書きする
export async function updateExpenseToFirestore(expense: Expense) {
    // 更新先のパスを作る
    // 例: users / test-user / expenses / 支出ID
    const expenseRef = doc(
        collection(db, "users", TEST_USER_ID, "expenses"),
        expense.id
    );

    // Firestoreの支出データを上書き保存する
    await setDoc(expenseRef, expense);
}

// Firestore上の支出データを削除する
export async function deleteExpenseFromFirestore(expenseId: string) {
    // 削除対象のパスを作る
    // 例: users / test-user / expenses / 支出ID
    const expenseRef = doc(
        collection(db, "users", TEST_USER_ID, "expenses"),
        expenseId
    );

    // Firestoreから支出データを削除する
    await deleteDoc(expenseRef);
}