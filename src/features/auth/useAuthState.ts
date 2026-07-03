import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";

export function useAuthState() {
  // 現在ログインしているFirebase Authenticationユーザーを管理する
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Firebaseがログイン状態を確認している間、画面にLoadingを表示するための状態
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    // Firebase Authenticationのログイン状態を監視する
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });

    // コンポーネントが不要になったときに監視を解除する
    return () => unsubscribe();
  }, []);

  return {
    currentUser,
    isAuthChecking,
  };
}
