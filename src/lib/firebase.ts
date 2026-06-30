import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// FirebaseプロジェクトとこのWebアプリを接続するための設定
// Viteでは、ブラウザ側で使う環境変数の名前を VITE_ から始める必要がある
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};


// Firebaseアプリを初期化する
const app = initializeApp(firebaseConfig);

// Firestoreを使うための接続オブジェクトを作る
export const db = getFirestore(app);