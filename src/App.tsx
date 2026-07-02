import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import AuthPage from "./features/auth/AuthPage";
import ResetPasswordPage from "./features/auth/ResetPasswordPage";
import SignUpPage from "./features/auth/SignUpPage";
import { initialCategories } from "./features/categories/categories";
import { logout } from "./lib/auth";
import { auth } from "./lib/firebase";
import {
  deleteExpenseFromFirestore,
  loadCategoriesFromFirestore,
  loadExpensesFromFirestore,
  saveCategoriesToFirestore,
  saveCategoryToFirestore,
  saveExpenseToFirestore,
  softDeleteCategoryToFirestore,
  updateCategoryToFirestore,
  updateExpenseCategoryNameToFirestore,
  updateExpenseToFirestore
} from "./lib/firestoreStorage";
import {
  loadCategoriesFromStorage,
  loadExpensesFromStorage,
  saveCategoriesToStorage,
  saveExpensesToStorage,
} from "./lib/localStorage";
import type { Category } from "./types/category";
import type { Expense } from "./types/expense";
import { sortCategories } from "./utils/sortCategories";

function App() {
  // ログイン中のユーザー情報を管理する
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Firebase Authenticationのログイン状態確認中かどうかを管理する
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [expenses, setExpenses] = useState<Expense[]>(loadExpensesFromStorage);
  const [categories, setCategories] = useState<Category[]>(() => {
    // localStorageからカテゴリーデータを読み込む
    const storageCategories = loadCategoriesFromStorage();

    // localStorageに空配列が保存されている場合は、初期カテゴリーを使う
    // これにより、初回表示でカテゴリーが何も出なくなるのを防ぐ
    if (storageCategories.length === 0) {
      return initialCategories;
    }

    return storageCategories;
  });

  // アプリ起動時にFirestoreから支出データとカテゴリーデータを読み込む
  // Firestoreが空の場合は、localStorageのデータをFirestoreへ移行する
  useEffect(() => {
    async function loadDataFromFirestore() {
      try {

        // ログイン中のユーザーがまだ取得できていない場合は読み込まない
        if (currentUser === null) {
          return;
        }

        // ユーザーが切り替わったときに、前のユーザーやlocalStorage由来のデータが一瞬表示されないようにする
        setExpenses([]);

        // カテゴリーはユーザーごとにFirestoreから読み込むため、まず初期カテゴリーに戻す
        setCategories(initialCategories);

        // ログイン中ユーザー専用のFirestoreデータを読み込む
        const firestoreExpenses = await loadExpensesFromFirestore(currentUser.uid);
        const firestoreCategories = await loadCategoriesFromFirestore(currentUser.uid);

        // Firestoreに支出データがある場合は、Firestoreのデータを画面に反映する
        if (firestoreExpenses.length > 0) {
          setExpenses(firestoreExpenses);
        }

        // Firestoreにカテゴリーデータがある場合は、Firestoreのデータを画面に反映する
        if (firestoreCategories.length > 0) {
          setCategories(firestoreCategories);
        }

        // Firestoreにカテゴリーデータがない場合は、初期カテゴリーをFirestoreへ保存する
        if (firestoreCategories.length === 0) {
          setCategories(initialCategories);
          await saveCategoriesToFirestore(currentUser.uid, initialCategories);
        }

      } catch (error) {
        // Firestore読み込みや初回移行に失敗しても、localStorageから読み込んだデータでは使える
        console.error("Firestoreからのデータ読み込みまたは初回移行に失敗しました", error);
      }
    }

    loadDataFromFirestore();
  }, [currentUser]);

  function createNextCategoryDisplayOrder(categoryType: "expense" | "income") {
    // 同じ種類のカテゴリーを取り出す
    const sameTypeCategories = categories.filter(
      (category) =>
        category.type === categoryType &&
        !category.isDeleted
    );

    // 「その他」は、displayOrder:99にしているため
    // 追加カテゴリーはその他の前に入るように99未満だけを見る
    const normalCategories = sameTypeCategories.filter(
      (category) => category.displayOrder < 99
    );

    // まだ通常カテゴリーがない場合は1から始める
    if (normalCategories.length === 0) {
      return 1;
    }

    //既存カテゴリーの最大displayOrderの次の番号を返す
    const maxDisplayOrder = Math.max(
      ...normalCategories.map((category) => category.displayOrder)
    );

    return maxDisplayOrder + 1;
  }

  async function addCategory(
    categoryName: string,
    categoryType: "expense" | "income",
  ) {
    // ログイン中のユーザーがいない場合は、Firestoreに保存できないため何もしない
    if (currentUser === null) {
      return;
    }

    // 同じ名前の削除済みカテゴリーがあるか確認する
    // ある場合は、新規追加ではなく復活させる
    const deletedCategory = categories.find(
      (category) =>
        category.name === categoryName &&
        category.type === categoryType &&
        category.isDeleted
    );

    if (deletedCategory) {
      // 復活させるカテゴリーを作る
      // Firestoreにも同じ内容を保存するため、変数として取り出しておく
      const restoredCategory: Category = {
        ...deletedCategory,
        isDeleted: false,
      };

      // 先に画面上のカテゴリー一覧を更新する
      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === restoredCategory.id
            ? restoredCategory
            : category
        )
      );

      try {
        // ログイン中ユーザー専用のFirestoreに、復活したカテゴリーを保存する
        await saveCategoryToFirestore(currentUser.uid, restoredCategory);
      } catch (error) {
        // Firestore保存に失敗しても、今はlocalStorage側には反映される
        // まずは開発中に原因を確認できるよう、コンソールに出す
        console.error("Firestoreへのカテゴリー復活保存に失敗しました", error);
      }

      return;
    }

    // 新しく追加するカテゴリーを作る
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: categoryName,
      type: categoryType,
      displayOrder: createNextCategoryDisplayOrder(categoryType),
      isDeleted: false,
    };

    // 先に画面上のカテゴリー一覧を更新する
    setCategories((currentCategories) => [
      ...currentCategories,
      newCategory,
    ]);

    try {
      // ログイン中ユーザー専用のFirestoreに、新しいカテゴリーを保存する
      await saveCategoryToFirestore(currentUser.uid, newCategory);
    } catch (error) {
      // Firestore保存に失敗しても、今はlocalStorage側にはデータが残る
      // まずは開発中に原因を確認できるよう、コンソールに出す
      console.error("Firestoreへのカテゴリー保存に失敗しました", error);
    }
  }

  async function addExpense(expense: Expense) {
    // ログイン中のユーザーがいない場合は保存しない
    if (currentUser === null) {
      return;
    }

    //先に画面上の支出一覧を更新する
    setExpenses((currentExpenses) => [expense, ...currentExpenses]);

    try {
      // ログイン中ユーザー専用のFirestoreに保存する
      await saveExpenseToFirestore(currentUser.uid, expense);
    } catch (error) {
      console.error("Firestoreへの支出・収入保存に失敗しました", error);
    }
  }

  async function updateExpense(updatedExpense: Expense) {
    // ログイン中のユーザーがいない場合は、Firestoreに保存できないため何もしない
    if (currentUser === null) {
      return;
    }
    // 先に画面上の支出データを更新する
    // これにより、Firestore保存を待たずに編集結果をすぐ反映できる
    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );

    try {
      // ログイン中ユーザー専用のFirestore上の支出・収入データを更新する
      await updateExpenseToFirestore(currentUser.uid, updatedExpense);
    } catch (error) {
      // Firestore更新に失敗しても、今はlocalStorage側には編集内容が残る
      // まずは開発中に原因を確認できるよう、コンソールに出す
      console.error("Firestoreへの支出更新に失敗しました", error);
    }
  }

  async function deleteExpense(expenseId: string) {
    // ログイン中のユーザーがいない場合は、Firestoreから削除できないため何もしない
    if (currentUser === null) {
      return;
    }
    // 先に画面上の支出データを削除する
    // これにより、Firestore削除を待たずに画面へすぐ反映できる
    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== expenseId)
    );

    try {
      // ログイン中ユーザー専用のFirestore上の支出・収入データを削除する
      await deleteExpenseFromFirestore(currentUser.uid, expenseId);
    } catch (error) {
      // Firestore削除に失敗しても、今はlocalStorage側では削除済みになる
      // まずは開発中に原因を確認できるよう、コンソールに出す
      console.error("Firestoreからの支出削除に失敗しました", error);
    }
  }

  async function updateCategory(categoryId: string, categoryName: string) {
    // ログイン中のユーザーがいない場合は、Firestoreに保存できないため何もしない
    if (currentUser === null) {
      return;
    }

    // Firestoreにも保存するため、更新後のカテゴリーを先に作る
    const updatedCategory = categories.find(
      (category) => category.id === categoryId
    );

    // 対象カテゴリーが見つからない場合は、何もしない
    if (!updatedCategory) {
      return;
    }

    const renamedCategory: Category = {
      ...updatedCategory,
      name: categoryName,
    };

    // 先に画面上のカテゴリー名を更新する
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === categoryId
          ? renamedCategory
          : category
      )
    );

    // 過去に登録した支出データの categoryName も更新する
    // categoryId は変えず、表示用のカテゴリー名だけを変える
    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.categoryId === categoryId
          ? { ...expense, categoryName }
          : expense
      )
    );

    try {
      // ログイン中ユーザー専用のFirestore上のカテゴリー名を更新する
      await updateCategoryToFirestore(currentUser.uid, renamedCategory);

      // ログイン中ユーザー専用のFirestore上の過去データのcategoryNameも更新する
      await updateExpenseCategoryNameToFirestore(
        currentUser.uid,
        categoryId,
        categoryName
      );
    } catch (error) {
      // Firestore更新に失敗しても、今はlocalStorage側には編集内容が残る
      // まずは開発中に原因を確認できるよう、コンソールに出す
      console.error("Firestoreへのカテゴリー更新に失敗しました", error);
    }
  }

  async function deleteCategory(categoryId: string) {
    // ログイン中のユーザーがいない場合は、Firestoreに保存できないため何もしない
    if (currentUser === null) {
      return;
    }

    // Firestoreにも保存するため、削除対象のカテゴリーを取得する
    const deleteTargetCategory = categories.find(
      (category) => category.id === categoryId
    );

    // 対象カテゴリーが見つからない場合は、何もしない
    if (!deleteTargetCategory) {
      return;
    }

    // 削除済みにしたカテゴリーを作る
    // 今のアプリでは完全削除ではなく、isDeleted: true にする
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
      // ログイン中ユーザー専用のFirestore上のカテゴリーを削除済みにする
      await softDeleteCategoryToFirestore(currentUser.uid, deletedCategory);
    } catch (error) {
      // Firestore更新に失敗しても、今はlocalStorage側では削除済みになる
      // まずは開発中に原因を確認できるよう、コンソールに出す
      console.error("Firestoreへのカテゴリー削除反映に失敗しました", error);
    }
  }

  async function handleLogout() {
    try {
      // Firebase Authenticationからログアウトする
      // ログアウトすると currentUser が null になり、ログイン画面へ戻る
      await logout();
    } catch (error) {
      // ログアウトに失敗した場合、開発中に原因を確認できるようにする
      console.error("ログアウトに失敗しました", error);
    }
  }

  // 支出データが変更されるたびに保存する
  // 今はlocalStorageに保存しているが、将来的にFirestore保存へ差し替えやすくする
  useEffect(() => {
    saveExpensesToStorage(expenses);
  }, [expenses]);

  // カテゴリーデータが変更されるたびに保存する
  // 今はlocalStorageに保存しているが、将来的にFirestore保存へ差し替えやすくする
  useEffect(() => {
    saveCategoriesToStorage(categories);
  }, [categories]);

  const activeCategories = sortCategories(
    categories.filter((category) => !category.isDeleted)
  );

  // 画面表示用にカテゴリーを並び替える
  // 「その他」は最後に表示する
  const sortedCategories = sortCategories(categories);



  // Firebase Authenticationのログイン状態を監視する
  // 一度ログイン済みなら次回以降もFirebaseがログイン状態を復元する
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });

    // Appが不要になったときに監視を解除する
    return () => unsubscribe();
  }, []);

  // ログイン状態を確認中は、何も表示せず待つ
  if (isAuthChecking) {
    return null;
  }

  // 未ログインならログイン画面を表示する
  if (currentUser === null) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <AppRoutes
      expenses={expenses}
      categories={categories}
      activeCategories={activeCategories}
      sortedCategories={sortedCategories}
      onLogout={handleLogout}
      onAddExpense={addExpense}
      onUpdateExpense={updateExpense}
      onDeleteExpense={deleteExpense}
      onAddCategory={addCategory}
      onUpdateCategory={updateCategory}
      onDeleteCategory={deleteCategory}
    />
  );
}

export default App;
