# 家計簿アプリ

React / TypeScript / Firebase で作成した、スマホ向けの家計簿アプリです。

## 主な機能

- 支出・収入の登録
- カテゴリー管理
- カレンダー表示
- カテゴリー別内訳
- ユーザー登録・ログイン
- メールアドレス認証
- パスワード再設定
- ユーザーごとのデータ保存

## 使用技術

- React
- TypeScript
- Vite
- MUI
- Firebase Authentication
- Cloud Firestore
- Vercel

## 開発環境

```bash
npm install
npm run dev
```
## ビルド
```bash
npm run build
```
## 環境変数
.env.local に Firebase の設定値を記載します。
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
