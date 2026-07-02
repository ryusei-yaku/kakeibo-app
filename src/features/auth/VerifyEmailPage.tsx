import { Button, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmailCode } from "../../lib/auth";
import AuthLayout from "./AuthLayout";

function VerifyEmailPage() {
    // ログイン画面へ移動するための関数
    const navigate = useNavigate();

    // URLのクエリパラメータを取得する
    // Firebaseの確認メールリンクには oobCode が含まれる
    const [searchParams] = useSearchParams();

    // 認証処理中かどうかを管理する
    const [isVerifying, setIsVerifying] = useState(true);

    // 認証完了したかどうかを管理する
    const [isVerified, setIsVerified] = useState(false);

    // エラーメッセージを管理する
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function verifyEmail() {
            // Firebaseの確認メールリンクに含まれる認証コードを取得する
            const oobCode = searchParams.get("oobCode");

            // 認証コードがない場合は処理できない
            if (oobCode === null) {
                setErrorMessage("確認リンクが正しくありません。");
                setIsVerifying(false);
                return;
            }

            try {
                // 認証コードをFirebaseに適用し、メールアドレス認証を完了する
                await verifyEmailCode(oobCode);

                setIsVerified(true);
            } catch {
                setErrorMessage(
                    "メールアドレスの確認に失敗しました。リンクの有効期限が切れている可能性があります。"
                );
            } finally {
                setIsVerifying(false);
            }
        }

        verifyEmail();
    }, [searchParams]);

    if (isVerifying) {
        return (
            <AuthLayout
                title="確認中です"
                description="メールアドレスを確認しています。"
            >
                <Typography
                    sx={{
                        color: "text.secondary",
                        fontWeight: "bold",
                    }}
                >
                    しばらくお待ちください。
                </Typography>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title={isVerified ? "メール確認が完了しました" : "確認できませんでした"}
            description={
                isVerified
                    ? "メールアドレスの確認が完了しました。ログイン画面からログインしてください。"
                    : "メールアドレスの確認に失敗しました。"
            }
        >
            <Stack spacing={2}>
                {errorMessage !== "" && (
                    <Typography sx={{ color: "#dc2626", fontWeight: "bold", lineHeight: 1.7 }}>
                        {errorMessage}
                    </Typography>
                )}

                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/login")}
                    sx={{
                        py: 1.4,
                        borderRadius: 3,
                        fontWeight: "bold",
                        backgroundColor: "#f59e0b",
                        "&:hover": {
                            backgroundColor: "#d97706",
                        },
                    }}
                >
                    ログイン画面へ
                </Button>
            </Stack>
        </AuthLayout>
    );
}

export default VerifyEmailPage;