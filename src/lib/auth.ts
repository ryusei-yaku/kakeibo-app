import {
    applyActionCode,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    type User,
} from "firebase/auth";
import { auth } from "./firebase";

// メールアドレスとパスワードで新規登録する
export function signUpWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
}

// ログイン中のユーザーにメールアドレス確認メールを送信する
export function sendVerificationEmail(user: User) {
    return sendEmailVerification(user);
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

// メール確認リンクに含まれるコードを使って、メールアドレス認証を完了する
export function verifyEmailCode(oobCode: string) {
    return applyActionCode(auth, oobCode);
}