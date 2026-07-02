import { Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithEmail } from "../../lib/auth";
import AuthLayout from "./AuthLayout";
import { isValidEmail } from "./authValidation";

function AuthPage() {
    // ログイン画面に入力されたメールアドレスを管理する
    const [email, setEmail] = useState("");

    // ログイン画面に入力されたパスワードを管理する
    const [password, setPassword] = useState("");

    // ログイン中・新規登録中の処理状態を管理する
    const [isLoading, setIsLoading] = useState(false);

    // エラーメッセージを画面に表示するために管理する
    const [errorMessage, setErrorMessage] = useState("");

    // 新規登録画面へ移動するための関数
    const navigate = useNavigate();

async function handleLogin() {
    setErrorMessage("");

    // メールアドレスとパスワードが未入力の場合はログイン処理をしない
    if (email.trim() === "" && password === "") {
        setErrorMessage("メールアドレス、パスワードを入力してください。");
        return;
    }

    // メールアドレスが未入力の場合はログイン処理をしない
    if (email.trim() === "") {
        setErrorMessage("メールアドレスを入力してください。");
        return;
    }

    // メールアドレスの形式が不正な場合はログイン処理をしない
    if (!isValidEmail(email)) {
        setErrorMessage("メールアドレスの形式が正しくありません。");
        return;
    }

    // パスワードが未入力の場合はログイン処理をしない
    if (password === "") {
        setErrorMessage("パスワードを入力してください。");
        return;
    }

    setIsLoading(true);

    try {
        // Firebase Authenticationでログインする
        await loginWithEmail(email, password);
    } catch {
        setErrorMessage("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
    } finally {
        setIsLoading(false);
    }
}

    return (
        <AuthLayout
            title="ログイン"
            description=""
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

                <Button
                    onClick={() => navigate("/reset-password")}
                    sx={{
                        alignSelf: "flex-start",
                        p: 0,
                        minWidth: 0,
                        color: "#f59e0b",
                        fontWeight: "bold",
                        textTransform: "none",
                        "&:hover": {
                            backgroundColor: "transparent",
                            textDecoration: "underline",
                        },
                    }}
                >
                    パスワードを忘れた方はこちら
                </Button>

                {errorMessage !== "" && (
                    <Typography sx={{ color: "#dc2626", fontWeight: "bold" }}>
                        {errorMessage}
                    </Typography>
                )}

                <Button
                    variant="contained"
                    size="large"
                    onClick={handleLogin}
                    disabled={isLoading}
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
                    ログイン
                </Button>

                <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate("/signup")}
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
                    新規登録はこちら
                </Button>
            </Stack>
        </AuthLayout>
    );
}

export default AuthPage;