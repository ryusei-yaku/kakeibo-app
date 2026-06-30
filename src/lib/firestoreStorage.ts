import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { Expense } from "../types/expense";
import type { Category } from "../types/category";

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

// Firestoreにカテゴリーデータを1件保存する
// カテゴリー追加時や、削除済みカテゴリーを復活させるときに使う
export async function saveCategoryToFirestore(category: Category) {
    // 保存先のパスを作る
    // 例: users / test-user / categories / カテゴリーID
    const categoryRef = doc(
        collection(db, "users", TEST_USER_ID, "categories"),
        category.id
    );

    // Firestoreにカテゴリーデータを保存する
    // setDoc は、指定したIDのドキュメントを作成または上書きする
    await setDoc(categoryRef, category);
}

// Firestore上のカテゴリーデータを更新する
// カテゴリー名の編集時に使う
export async function updateCategoryToFirestore(category: Category) {
    // 更新先のパスを作る
    // 例: users / test-user / categories / カテゴリーID
    const categoryRef = doc(
        collection(db, "users", TEST_USER_ID, "categories"),
        category.id
    );

    // Firestoreのカテゴリーデータを上書き保存する
    await setDoc(categoryRef, category);
}

// Firestore上のカテゴリーを削除済みにする
// 今のアプリでは完全削除ではなく、isDeleted: true に更新する
export async function softDeleteCategoryToFirestore(category: Category) {
    // 更新先のパスを作る
    // 例: users / test-user / categories / カテゴリーID
    const categoryRef = doc(
        collection(db, "users", TEST_USER_ID, "categories"),
        category.id
    );

    // Firestore上でも削除済みカテゴリーとして保存する
    await setDoc(categoryRef, {
        ...category,
        isDeleted: true,
    });
}