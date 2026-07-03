import { useEffect, useState } from "react";
import AppRoutes from "./AppRoutes";
import ErrorDialog from "./components/ErrorDialog";
import LoadingScreen from "./components/LoadingScreen";
import AuthRoutes from "./features/auth/AuthRoutes";
import { useAuthState } from "./features/auth/useAuthState";
import { initialCategories } from "./features/categories/categories";
import { logout } from "./lib/auth";
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
  updateExpenseToFirestore,
  loadProfileFromFirestore,
  saveProfileToFirestore,
} from "./lib/firestoreStorage";
import type { Category } from "./types/category";
import type { Expense } from "./types/expense";
import { sortCategories } from "./utils/sortCategories";
import type { Profile } from "./types/profile";

function App() {

  const { currentUser, isAuthChecking } = useAuthState();

  // Firestoreから家計簿データを読み込み中かどうかを管理する
  const [isFirestoreLoading, setIsFirestoreLoading] = useState(false);

  // ユーザーに表示するエラーメッセージを管理する
  const [errorMessage, setErrorMessage] = useState("");

  // Firestoreから読み込むまでは、支出・収入データは空で始める
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Firestoreから読み込むまでは、初期カテゴリーを表示する
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // ログイン中ユーザーのプロフィール情報を管理する
  const [profile, setProfile] = useState<Profile>({
    displayName: "",
  });

  function showError(message: string) {
    // ユーザーに表示するエラーメッセージをセットする
    setErrorMessage(message);
  }

  async function loadDataFromFirestore() {
    // ログイン中のユーザーがまだ取得できていない場合は読み込まない
    if (currentUser === null) {
      return;
    }

    // 前回のエラー表示を消す
    setErrorMessage("");

    // Firestoreの読み込みを開始する
    setIsFirestoreLoading(true);

    try {
      // ログイン中ユーザー専用のFirestoreデータを読み込む
      const firestoreExpenses = await loadExpensesFromFirestore(currentUser.uid);
      const firestoreCategories = await loadCategoriesFromFirestore(currentUser.uid);
      // ログイン中ユーザー専用のプロフィール情報を読み込む
      const firestoreProfile = await loadProfileFromFirestore(currentUser.uid);

      // Firestoreの支出・収入データを画面に反映する
      setExpenses(firestoreExpenses);

      // Firestoreにカテゴリーがない場合は、初期カテゴリーを保存して使う
      if (firestoreCategories.length === 0) {
        setCategories(initialCategories);
        await saveCategoriesToFirestore(currentUser.uid, initialCategories);
        return;
      }

      // Firestoreのカテゴリーデータを画面に反映する
      setCategories(firestoreCategories);

      // Firestoreのプロフィール情報を画面に反映する
      setProfile(firestoreProfile);
    } catch (error) {
      console.error("Firestoreからのデータ読み込みに失敗しました", error);

      setErrorMessage(
        "家計簿データの読み込みに失敗しました。通信環境を確認して、もう一度お試しください。"
      );
    } finally {
      setIsFirestoreLoading(false);
    }
  }

  // アプリ起動時にFirestoreから支出データとカテゴリーデータを読み込む
  useEffect(() => {
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
      // Firestore保存に失敗したときに元へ戻せるよう、変更前のカテゴリー一覧を保存する
      const previousCategories = categories;

      // 復活させるカテゴリーを作る
      const restoredCategory: Category = {
        ...deletedCategory,
        isDeleted: false,
      };

      // 先に画面上のカテゴリー一覧を更新する
      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === restoredCategory.id ? restoredCategory : category
        )
      );

      try {
        // ログイン中ユーザー専用のFirestoreに、復活したカテゴリーを保存する
        await saveCategoryToFirestore(currentUser.uid, restoredCategory);
      } catch (error) {
        console.error("Firestoreへのカテゴリー復活保存に失敗しました", error);

        // Firestore保存に失敗した場合は、画面上のカテゴリー一覧を元に戻す
        setCategories(previousCategories);

        showError("カテゴリーの保存に失敗しました。通信環境を確認して、もう一度お試しください。");
      }

      return;
    }

    // Firestore保存に失敗したときに元へ戻せるよう、追加前のカテゴリー一覧を保存する
    const previousCategories = categories;

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
      console.error("Firestoreへのカテゴリー保存に失敗しました", error);

      // Firestore保存に失敗した場合は、画面上のカテゴリー一覧を追加前に戻す
      setCategories(previousCategories);

      showError("カテゴリーの保存に失敗しました。通信環境を確認して、もう一度お試しください。");
    }
  }

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
        currentExpenses.filter((currentExpense) => currentExpense.id !== expense.id)
      );

      showError("保存に失敗しました。通信環境を確認して、もう一度お試しください。");
    }
  }

  async function updateExpense(updatedExpense: Expense) {
    // ログイン中のユーザーがいない場合は、Firestoreに保存できないため何もしない
    if (currentUser === null) {
      return;
    }

    // Firestore更新に失敗したときに元へ戻せるよう、更新前の一覧を保存する
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

      showError("更新に失敗しました。通信環境を確認して、もう一度お試しください。");
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

      showError("削除に失敗しました。通信環境を確認して、もう一度お試しください。");
    }
  }

  async function updateCategory(categoryId: string, categoryName: string) {
    // ログイン中のユーザーがいない場合は、Firestoreに保存できないため何もしない
    if (currentUser === null) {
      return;
    }

    // Firestore更新に失敗したときに元へ戻せるよう、変更前の一覧を保存する
    const previousCategories = categories;
    const previousExpenses = expenses;

    // Firestoreにも保存するため、更新対象のカテゴリーを先に探す
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
        category.id === categoryId ? renamedCategory : category
      )
    );

    // 過去に登録した支出・収入データの categoryName も更新する
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

      // ログイン中ユーザー専用のFirestore上の過去データの categoryName も更新する
      await updateExpenseCategoryNameToFirestore(
        currentUser.uid,
        categoryId,
        categoryName
      );
    } catch (error) {
      console.error("Firestoreへのカテゴリー更新に失敗しました", error);

      // Firestore更新に失敗した場合は、画面上のデータを更新前に戻す
      setCategories(previousCategories);
      setExpenses(previousExpenses);

      showError("カテゴリーの更新に失敗しました。通信環境を確認して、もう一度お試しください。");
    }
  }

  async function deleteCategory(categoryId: string) {
    // ログイン中のユーザーがいない場合は、Firestoreに保存できないため何もしない
    if (currentUser === null) {
      return;
    }

    // Firestore更新に失敗したときに元へ戻せるよう、変更前のカテゴリー一覧を保存する
    const previousCategories = categories;

    // Firestoreにも保存するため、削除対象のカテゴリーを取得する
    const deleteTargetCategory = categories.find(
      (category) => category.id === categoryId
    );

    // 対象カテゴリーが見つからない場合は、何もしない
    if (!deleteTargetCategory) {
      return;
    }

    // 削除済みにしたカテゴリーを作る
    const deletedCategory: Category = {
      ...deleteTargetCategory,
      isDeleted: true,
    };

    // 先に画面上のカテゴリーを削除済みにする
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === categoryId ? deletedCategory : category
      )
    );

    try {
      // ログイン中ユーザー専用のFirestore上のカテゴリーを削除済みにする
      await softDeleteCategoryToFirestore(currentUser.uid, deletedCategory);
    } catch (error) {
      console.error("Firestoreへのカテゴリー削除反映に失敗しました", error);

      // Firestore更新に失敗した場合は、画面上のカテゴリー一覧を更新前に戻す
      setCategories(previousCategories);

      showError("カテゴリーの削除に失敗しました。通信環境を確認して、もう一度お試しください。");
    }
  }

  async function saveDisplayName(displayName: string) {
    // ログイン中のユーザーがいない場合は、Firestoreに保存できないため何もしない
    if (currentUser === null) {
      return;
    }

    // Firestore保存に失敗したときに元へ戻せるよう、変更前のプロフィールを保存する
    const previousProfile = profile;

    const updatedProfile: Profile = {
      displayName,
    };

    // 先に画面上のプロフィール情報を更新する
    setProfile(updatedProfile);

    try {
      // ログイン中ユーザー専用のFirestoreにプロフィール情報を保存する
      await saveProfileToFirestore(currentUser.uid, updatedProfile);
    } catch (error) {
      console.error("Firestoreへのプロフィール保存に失敗しました", error);

      // Firestore保存に失敗した場合は、画面上のプロフィールを保存前に戻す
      setProfile(previousProfile);

      showError("プロフィールの保存に失敗しました。通信環境を確認して、もう一度お試しください。");
    }
  }

  async function handleLogout() {
    try {
      // Firebase Authenticationからログアウトする
      // ログアウトすると currentUser が null になり、ログイン画面へ戻る
      await logout();
    } catch (error) {
      console.error("ログアウトに失敗しました", error);

      showError("ログアウトに失敗しました。通信環境を確認して、もう一度お試しください。");
    }
  }

  const activeCategories = sortCategories(
    categories.filter((category) => !category.isDeleted)
  );

  // 画面表示用にカテゴリーを並び替える
  // 「その他」は最後に表示する
  const sortedCategories = sortCategories(categories);

  if (isAuthChecking) {
    return <LoadingScreen />;
  }

  // 未ログインならログイン画面を表示する
  if (currentUser === null || !currentUser.emailVerified) {
    return <AuthRoutes />;
  }

  // Firestoreから家計簿データを読み込み中は、ホーム画面風のスケルトンを表示する
  if (isFirestoreLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
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
        currentUser={currentUser}
        profile={profile}
        onSaveDisplayName={saveDisplayName}
      />

      <ErrorDialog
        open={errorMessage !== ""}
        title="読み込みに失敗しました"
        message={errorMessage}
        onClose={() => setErrorMessage("")}
        onRetry={loadDataFromFirestore}
      />

    </>
  );
}

export default App;
