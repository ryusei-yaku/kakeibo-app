// メールアドレスの形式を簡易チェックする
export function isValidEmail(email: string) {
    // 一般的なメールアドレス形式を判定する
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// パスワードが6文字以上か確認する
export function isValidPassword(password: string) {
    return password.length >= 6;
}