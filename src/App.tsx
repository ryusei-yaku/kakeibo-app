import { useState } from "react";
import AppRoutes from "./AppRoutes";
import ErrorDialog from "./components/ErrorDialog";
import LoadingScreen from "./components/LoadingScreen";
import { useInitialDataLoading } from "./features/app/useInitialDataLoading";
import AuthRoutes from "./features/auth/AuthRoutes";
import { useAuthState } from "./features/auth/useAuthState";
import { useCategories } from "./features/categories/useCategories";
import { useExpenses } from "./features/expenses/useExpenses";
import { logout } from "./lib/auth";
import { saveProfileToFirestore } from "./lib/firestoreStorage";
import type { Profile } from "./types/profile";

function App() {

  const { currentUser, isAuthChecking } = useAuthState();

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

  // ログイン中ユーザーの家計簿データをFirestoreから読み込む
  const {
    isFirestoreLoading,
    loadDataFromFirestore,
  } = useInitialDataLoading({
    currentUser,
    setExpenses,
    setCategories,
    setProfile,
    onError: showError,
  });

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
