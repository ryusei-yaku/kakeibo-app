import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { sendPasswordResetEmail } from "firebase/auth";

// メールアドレスとパスワードで新規登録する
export function signUpWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
}

// メールアドレスとパスワードでログインする
export function loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}

// パスワード再設定メールを送信する
export function resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
}

// ログアウトする
export function logout() {
    return signOut(auth);
}