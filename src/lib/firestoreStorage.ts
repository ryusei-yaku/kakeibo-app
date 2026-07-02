import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
    getDoc,
} from "firebase/firestore";
import type { Category } from "../types/category";
import type { Expense } from "../types/expense";
import { db } from "./firebase";
import { initialCategories } from "../features/categories/categories";
import type { Profile } from "../types/profile";

//FireStoreに支出データを1件保存する
export async function saveExpenseToFirestore(userId: string, expense: Expense) {
    // ログイン中ユーザー専用の保存先パスを作る
    // 例: users / ログインユーザーID / expenses / 支出ID
    const expenseRef = doc(
        collection(db, "users", userId, "expenses"),
        expense.id
    );

    await setDoc(expenseRef, expense);
}

// Firestoreに複数の支出データをまとめて保存する
export async function saveExpensesToFirestore(userId: string, expenses: Expense[]) {
    const savePromises = expenses.map((expense) => {
        const expenseRef = doc(
            collection(db, "users", userId, "expenses"),
            expense.id
        );

        return setDoc(expenseRef, expense);
    });

    await Promise.all(savePromises);

}

// Firestore上の支出データを更新する
// 今回は追加と同じく setDoc を使い、同じIDのドキュメントを上書きする
export async function updateExpenseToFirestore(userId: string, expense: Expense) {
    // 更新先のパスを作る
    // 例: users / test-user / expenses / 支出ID
    const expenseRef = doc(
        collection(db, "users", userId, "expenses"),
        expense.id
    );

    // Firestoreの支出データを上書き保存する
    await setDoc(expenseRef, expense);
}

// Firestore上の支出データを削除する
export async function deleteExpenseFromFirestore(userId: string, expenseId: string) {
    // 削除対象のパスを作る
    // 例: users / ログインユーザーID / expenses / 支出ID
    const expenseRef = doc(
        collection(db, "users", userId, "expenses"),
        expenseId
    );

    // Firestoreから支出データを削除する
    await deleteDoc(expenseRef);
}

// Firestoreにカテゴリーデータを1件保存する
// カテゴリー追加時や、削除済みカテゴリーを復活させるときに使う
export async function saveCategoryToFirestore(userId: string, category: Category) {
    // 保存先のパス作成
    // 例:users/ログインユーザーID/categories/カテゴリーID
    const categoryRef = doc(
        collection(db, "users", userId, "categories"),
        category.id
    );

    // Firestoreにカテゴリーデータを保存する
    await setDoc(categoryRef, category);
}

// Firestoreに複数のカテゴリーデータをまとめて保存する
// 初回起動時に、初期カテゴリーをFirestoreへ登録するために使う
export async function saveCategoriesToFirestore(userId: string, categories: Category[]) {
    // カテゴリーごとにFirestore保存処理を作る
    const savePromises = categories.map((category) => {
        // 保存先のパスを作る
        // 例: users / ログインユーザーID / categories / カテゴリーID
        const categoryRef = doc(
            collection(db, "users", userId, "categories"),
            category.id
        );

        // Firestoreにカテゴリーデータを保存する
        // setDoc は、指定したIDのドキュメントを作成または上書きする
        return setDoc(categoryRef, category);
    });

    // すべてのカテゴリー保存が終わるまで待つ
    await Promise.all(savePromises);
}

// Firestore上のカテゴリーデータを更新する
// カテゴリー名の編集時に使う
export async function updateCategoryToFirestore(userId: string, category: Category) {
    // 更新先のパスを作る
    // 例: users / ログインユーザーID / categories / カテゴリーID
    const categoryRef = doc(
        collection(db, "users", userId, "categories"),
        category.id
    );

    // Firestoreのカテゴリーデータを上書き保存する
    await setDoc(categoryRef, category);
}

// Firestore上のカテゴリーを削除済みにする
// 今のアプリでは完全削除ではなく、isDeleted: true に更新する
export async function softDeleteCategoryToFirestore(userId: string, category: Category) {
    // 更新先のパスを作る
    // 例: users / ログインユーザーID/ categories / カテゴリーID
    const categoryRef = doc(
        collection(db, "users", userId, "categories"),
        category.id
    );

    // Firestore上でも削除済みカテゴリーとして保存する
    await setDoc(categoryRef, {
        ...category,
        isDeleted: true,
    });
}

// Firestore上の過去支出データのカテゴリー名をまとめて更新する
// カテゴリー名を編集したとき、同じcategoryIdを持つ支出のcategoryNameも変更する
export async function updateExpenseCategoryNameToFirestore(
    userId: string,
    categoryId: string,
    categoryName: string
) {
    // 支出データが入っているコレクションを指定する
    // 例: users / ログインユーザーID / expenses
    const expensesRef = collection(db, "users", userId, "expenses");

    // categoryId が一致する支出だけを取得する条件を作る
    const expensesQuery = query(
        expensesRef,
        where("categoryId", "==", categoryId)
    );

    // 条件に一致する支出データをFirestoreから取得する
    const querySnapshot = await getDocs(expensesQuery);

    // 条件に一致した支出データを1件ずつ更新する
    const updatePromises = querySnapshot.docs.map((expenseDoc) =>
        updateDoc(expenseDoc.ref, {
            categoryName,
        })
    );

    // すべての更新が終わるまで待つ
    await Promise.all(updatePromises);
}

// Firestoreから支出データをすべて読み込む
export async function loadExpensesFromFirestore(userId: string) {
    // 支出データが入っているコレクションを指定する
    // 例: users / ログインユーザーID / expenses
    const expensesRef = collection(db, "users", userId, "expenses");

    // Firestoreから支出データを取得する
    const querySnapshot = await getDocs(expensesRef);

    // Firestoreのドキュメントを、アプリで使う Expense[] の形に変換する
    const expenses = querySnapshot.docs.map((expenseDoc) => {
        const expense = expenseDoc.data() as Expense;

        // 古いFirestoreデータには、typeが存在しない可能性がある
        // その場合は、これまで通り「支出」として扱う
        return {
            ...expense,
            type: expense.type ?? "expense",
        }
    });

    // 日付が新しい順に並べる
    // Firestoreから取得した順番は画面表示用に保証されていないため、ここで並び替える
    return expenses.sort((a, b) => b.date.localeCompare(a.date));
}

// Firestoreに保存済みのカテゴリーに、初期カテゴリーで足りないものを補う
function mergeWithInitialCategories(categories: Category[]) {
    //初期カテゴリーのうち、Firestore側に存在しないものだけを取り出す
    const missingInitialCategories = initialCategories.filter(
        (initialCategory) =>
            !categories.some(
                (category) =>
                    category.id === initialCategory.id ||
                    (
                        category.type === initialCategory.type &&
                        category.name === initialCategory.name
                    )
            )
    );

    // Firestore側のカテゴリーを優先し、足りない初期カテゴリーを追加
    return [...categories, ...missingInitialCategories];
}

// Firestoreからカテゴリーデータをすべて読み込む
export async function loadCategoriesFromFirestore(userId: string) {
    // カテゴリーデータが入っているコレクションを指定する
    // 例: users /ログインユーザーID/ categories
    const categoriesRef = collection(db, "users", userId, "categories");

    // Firestoreからカテゴリーデータを取得する
    const querySnapshot = await getDocs(categoriesRef);

    // Firestoreのドキュメントを、アプリで使う Category[] の形に変換する
    const categories = querySnapshot.docs.map((categoryDoc) => {
        const category = categoryDoc.data() as Category;

        return {
            ...category,

            // 古いFirestoreデータには type が存在しない可能性がある
            // その場合は、これまで通り支出カテゴリーとして扱う
            type: category.type ?? "expense",

            //古い保存データにはdisplayOrderが存在しない可能性
            // その場合は、50として中間あたりに表示
            displayOrder: category.displayOrder ?? 50,

            // 古いデータや手動追加データで isDeleted がない場合に備える
            // isDeleted がない場合は、削除されていないカテゴリーとして扱う
            isDeleted: category.isDeleted ?? false,
        };
    });

    //Firestoreに保存されているカテゴリーを返す
    // ただし、古いデータで初期カテゴリーが不足している場合は補完する
    return mergeWithInitialCategories(categories);
}

// Firestoreからプロフィール情報を読み込む
export async function loadProfileFromFirestore(userId: string) {
    // プロフィール情報が入っているドキュメントを指定する
    // 例: users / ログインユーザーID / profile / main
    const profileRef = doc(db, "users", userId, "profile", "main");

    // Firestoreからプロフィール情報を取得する
    const profileSnapshot = await getDoc(profileRef);

    // プロフィールがまだ作成されていない場合は、初期値を返す
    if (!profileSnapshot.exists()) {
        return {
            displayName: "",
        };
    }

    // Firestoreのデータを、アプリで使う Profile 型として扱う
    const profile = profileSnapshot.data() as Profile;

    return {
        displayName: profile.displayName ?? "",
    };
}

// Firestoreにプロフィール情報を保存する
export async function saveProfileToFirestore(
    userId: string,
    profile: Profile
) {
    // 保存先のドキュメントを指定する
    // 例: users / ログインユーザーID / profile / main
    const profileRef = doc(db, "users", userId, "profile", "main");

    // プロフィール情報を作成または上書きする
    await setDoc(profileRef, profile);
}