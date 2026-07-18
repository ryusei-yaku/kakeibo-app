import type { User } from "firebase/auth";
import {
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import { saveProfileToFirestore } from "../../lib/firestoreStorage";
import type { Profile } from "../../types/profile";

type UseProfileProps = {
    // 現在ログインしているユーザー
    currentUser: User | null;

    // Firestore操作に失敗した場合にエラーを表示するための関数
    onError: (message: string) => void;
};

type UseProfileReturn = {
    // ログイン中ユーザーのプロフィール情報
    profile: Profile;

    // 初期データ読み込み時にプロフィールを反映するための関数
    setProfile: Dispatch<SetStateAction<Profile>>;

    // 表示名を保存するための関数
    saveDisplayName: (displayName: string) => Promise<void>;
};

export function useProfile({
    currentUser,
    onError,
}: UseProfileProps): UseProfileReturn {
    // ログイン中ユーザーのプロフィール情報を管理する
    const [profile, setProfile] = useState<Profile>({
        displayName: "",
    });

    async function saveDisplayName(displayName: string): Promise<void> {
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

            onError(
                "プロフィールの保存に失敗しました。通信環境を確認して、もう一度お試しください。"
            );
        }
    }

    return {
        profile,
        setProfile,
        saveDisplayName,
    };
}