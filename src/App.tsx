import { useEffect, useState } from "react";
import AppRoutes from "./AppRoutes";
import ErrorDialog from "./components/ErrorDialog";
import LoadingScreen from "./components/LoadingScreen";
import AuthRoutes from "./features/auth/AuthRoutes";
import { useAuthState } from "./features/auth/useAuthState";
import { initialCategories } from "./features/categories/categories";
import { useCategories } from "./features/categories/useCategories";
import { useExpenses } from "./features/expenses/useExpenses";
import { logout } from "./lib/auth";
import {
  loadCategoriesFromFirestore,
  loadExpensesFromFirestore,
  loadProfileFromFirestore,
  saveCategoriesToFirestore,
  saveProfileToFirestore,
} from "./lib/firestoreStorage";
import type { Profile } from "./types/profile";

function App() {

  const { currentUser, isAuthChecking } = useAuthState();

  // Firestoreから家計簿データを読み込み中かどうかを管理する
  const [isFirestoreLoading, setIsFirestoreLoading] = useState(false);

  // ユーザーに表示するエラーメッセージを管理する
  const [errorMessage, setErrorMessage] = useState("");

  // ログイン中ユーザーのプロフィール情報を管理する
  const [profile, setProfile] = useState<Profile>({
    displayName: "",
  });

  function showError(message: string) {
    // ユーザーに表示するエラーメッセージをセットする
    setErrorMessage(message);
  }

  // 支出・収入データと、その追加・更新・削除処理を管理する
  const {
    expenses,
    setExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses({
    currentUser,
    onError: showError,
  });

  // カテゴリーデータと、その追加・更新・削除処理を管理する
  const {
    categories,
    setCategories,
    activeCategories,
    sortedCategories,
    addCategory,
    updateCategory,
    deleteCategory
  } = useCategories({
    currentUser,
    expenses,
    setExpenses,
    onError: showError,
  });

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
