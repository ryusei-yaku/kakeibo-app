import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// FirebaseプロジェクトとこのWebアプリを接続するための設定
// この値は、Firebase ConsoleでWebアプリを登録すると発行される
const firebaseConfig = {
    apiKey: "ここにapiKey",
    authDomain: "ここにauthDomain",
    projectId: "ここにprojectId",
    storageBucket: "ここにstorageBucket",
    messagingSenderId: "ここにmessagingSenderId",
    appId: "ここにappId",
};

// Firebaseアプリを初期化する
const app = initializeApp(firebaseConfig);

// Firestoreを使うための接続オブジェクトを作る
export const db = getFirestore(app);