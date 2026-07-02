import { Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUpWithEmail } from "../../lib/auth";
import AuthLayout from "./AuthLayout";
import { isValidEmail, isValidPassword } from "./authValidation";

function SignUpPage() {
    // ログイン画面へ戻るための関数
    const navigate = useNavigate();

    // 新規登録用のメールアドレスを管理する
    const [email, setEmail] = useState("");

    // 新規登録用のパスワードを管理する
    const [password, setPassword] = useState("");

    // 新規登録処理中かどうかを管理する
    const [isLoading, setIsLoading] = useState(false);

    // エラーメッセージを画面に表示するために管理する
    const [errorMessage, setErrorMessage] = useState("");

    async function handleSignUp() {
        setErrorMessage("");

        // メールアドレスが未入力の場合は新規登録しない
        if (email.trim() === "") {
            setErrorMessage("メールアドレスを入力してください。");
            return;
        }

        // メールアドレスの形式が不正な場合は新規登録しない
        if (!isValidEmail(email)) {
            setErrorMessage("メールアドレスの形式が正しくありません。");
            return;
        }

        // パスワードが未入力の場合は新規登録しない
        if (password === "") {
            setErrorMessage("パスワードを入力してください。");
            return;
        }

        // パスワードが6文字未満の場合は新規登録しない
        if (!isValidPassword(password)) {
            setErrorMessage("パスワードは6文字以上で入力してください。");
            return;
        }

        setIsLoading(true);

        try {
            // Firebase Authenticationで新規登録する
            await signUpWithEmail(email, password);
        } catch {
            setErrorMessage("新規登録に失敗しました。メールアドレスやパスワードを確認してください。");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AuthLayout
            title="新規登録"
            description="メールアドレスとパスワードを登録してください。"
        >
            <Stack spacing={2}>
                <TextField
                    label="メールアドレス"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    fullWidth
                />

                <TextField
                    label="パスワード"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    fullWidth
                />

                <Typography
                    sx={{
                        color: "text.secondary",
                        fontSize: 13,
                        fontWeight: "bold",
                        lineHeight: 1.6,
                    }}
                >
                    メールアドレスは受信できるものを入力してください。
                    <br />
                    パスワードは6文字以上で入力してください。
                </Typography>

                {errorMessage !== "" && (
                    <Typography sx={{ color: "#dc2626", fontWeight: "bold" }}>
                        {errorMessage}
                    </Typography>
                )}

                <Button
                    variant="contained"
                    size="large"
                    onClick={handleSignUp}
                    disabled={isLoading}
                    sx={{
                        py: 1.4,
                        borderRadius: 3,
                        fontWeight: "bold",
                        backgroundColor: "#f59e0b",
                        "&:hover": { backgroundColor: "#d97706" },
                    }}
                >
                    新規登録する
                </Button>

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

export default SignUpPage;