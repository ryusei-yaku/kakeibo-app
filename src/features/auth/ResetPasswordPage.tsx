import { Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../lib/auth";
import AuthLayout from "./AuthLayout";
import { isValidEmail } from "./authValidation";

function ResetPasswordPage() {
    // ログイン画面へ戻るための関数
    const navigate = useNavigate();

    // パスワード再設定メールを送るメールアドレスを管理する
    const [email, setEmail] = useState("");

    // 送信処理中かどうかを管理する
    const [isLoading, setIsLoading] = useState(false);

    // エラーメッセージを画面に表示するために管理する
    const [errorMessage, setErrorMessage] = useState("");

    // 送信成功メッセージを画面に表示するために管理する
    const [successMessage, setSuccessMessage] = useState("");

    // 再設定メールを送信できたかどうかを判定する
    const isSent = successMessage !== "";

    async function handleResetPassword() {
        setErrorMessage("");
        setSuccessMessage("");

        // メールアドレスが未入力の場合は再設定メールを送信しない
        if (email.trim() === "") {
            setErrorMessage("メールアドレスを入力してください。");
            return;
        }

        // メールアドレスの形式が不正な場合は再設定メールを送信しない
        if (!isValidEmail(email)) {
            setErrorMessage("メールアドレスの形式が正しくありません。");
            return;
        }

        setIsLoading(true);

        try {
            // 入力されたメールアドレス宛にパスワード再設定メールを送信する
            await resetPassword(email);

            setSuccessMessage(
                "パスワード再設定メールを送信しました。メール内のリンクから新しいパスワードを設定してください。"
            );
        } catch (error) {
            console.error("パスワード再設定メールの送信に失敗しました", error);

            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error
            ) {
                if (error.code === "auth/user-not-found") {
                    setErrorMessage("このメールアドレスは登録されていません。");
                    return;
                }

                if (error.code === "auth/too-many-requests") {
                    setErrorMessage("短時間に何度も送信されています。時間をおいて再度お試しください。");
                    return;
                }
            }

            setErrorMessage("パスワード再設定メールの送信に失敗しました。時間をおいて再度お試しください。");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            title="パスワード再設定"
            description={!isSent ?
                "登録したメールアドレスを入力してください。パスワード再設定用のメールを送信します。"
                : ""
            }
        >
            <Stack spacing={2}>
                {!isSent && (
                    <TextField
                        label="メールアドレス"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        fullWidth
                    />
                )}

                {errorMessage !== "" && (
                    <Typography sx={{ color: "#dc2626", fontWeight: "bold" }}>
                        {errorMessage}
                    </Typography>
                )}

                {successMessage !== "" && (
                    <Typography sx={{ fontWeight: "bold", lineHeight: 1.7 }}>
                        {successMessage}
                    </Typography>
                )}

                {!isSent && (
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleResetPassword}
                        disabled={isLoading}
                        sx={{
                            py: 1.4,
                            borderRadius: 3,
                            fontWeight: "bold",
                            backgroundColor: "#f59e0b",
                            "&:hover": { backgroundColor: "#d97706" },
                        }}
                    >
                        再設定メールを送信する
                    </Button>
                )}

                <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/login")}
                    disabled={isLoading}
                    sx={{
                        py: 1.4,
                        borderRadius: 3,
                        fontWeight: "bold",
                        color: "#f59e0b",
                        borderColor: "#f59e0b",
                        "&:hover": {
                            backgroundColor: "#fde7cd",
                            borderColor: "#d97706",
                        },
                    }}
                >
                    ログイン画面へ戻る
                </Button>
            </Stack>
        </AuthLayout>
    );
}

export default ResetPasswordPage;