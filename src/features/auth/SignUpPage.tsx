import { Button, Stack, TextField, Typography } from "@mui/material";
import type { User } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendVerificationEmail, signUpWithEmail } from "../../lib/auth";
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

    const [successMessage, setSuccessMessage] = useState("");

    // 確認メールを送信済みかどうかを管理する
    const [isVerificationEmailSent, setIsVerificationEmailSent] = useState(false);

    // 確認メールを再送するため、新規登録したユーザー情報を保持する
    const [registeredUser, setRegisteredUser] = useState<User | null>(null);

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
            const userCredential = await signUpWithEmail(email, password);

            // 確認メールを再送できるように、新規登録したユーザー情報を保存する
            setRegisteredUser(userCredential.user);

            // 新規登録したユーザー宛に確認メールを送信する
            await sendVerificationEmail(userCredential.user);

            // 確認メール送信後は、送信完了画面を表示する
            setIsVerificationEmailSent(true);

        } catch (error) {
            // 新規登録や確認メール送信で失敗した内容を開発中に確認する
            console.error("新規登録または確認メール送信に失敗しました", error);

            // Firebase Authenticationで、すでに登録済みのメールアドレスだった場合
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === "auth/email-already-in-use"
            ) {
                setErrorMessage("このメールアドレスは既に登録されています。");
                return;
            }

            setErrorMessage("新規登録または確認メール送信に失敗しました。メールアドレスやパスワードを確認してください。");
        } finally {
            setIsLoading(false);
        }
    }

    if (isVerificationEmailSent) {
        return (
            <AuthLayout
                title="メールを送信しました"
                description=""
            >
                <Stack spacing={2}>
                    <Typography
                        sx={{
                            color: "text.secondary",
                            lineHeight: 1.8,
                            fontSize: 14,
                        }}
                    >
                        ご入力のメールアドレス宛に認証メールを送信しました。
                        <br />
                        メール内のリンクを開くと登録が完了します。
                    </Typography>

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
                    <Typography
                        sx={{
                            color: "text.secondary",
                            fontSize: 12,
                            lineHeight: 1.7,
                        }}
                    >
                        ※メールが届くまで数分かかる場合があります。
                        <br />
                        ※迷惑メールフォルダもご確認ください。
                    </Typography>
                    <Button
                        onClick={async () => {
                            setErrorMessage("");
                            setSuccessMessage("");

                            try {
                                if (registeredUser === null) {
                                    setErrorMessage("確認メールを再送できませんでした。もう一度新規登録をお試しください。");
                                    return;
                                }

                                await sendVerificationEmail(registeredUser);
                                setSuccessMessage("確認メールを再送しました。");
                            } catch (error) {
                                console.error("確認メールの再送信に失敗しました", error);
                                setErrorMessage("確認メールの再送信に失敗しました。時間をおいて再度お試しください。");
                            }
                        }}
                        size="small"
                        sx={{
                            alignSelf: "flex-start",
                            p: 0,
                            minWidth: 0,
                            color: "text.secondary",
                            textTransform: "none",
                            textDecoration: "underline",
                            "&:hover": {
                                backgroundColor: "transparent",
                                textDecoration: "underline",
                            },
                        }}
                    >
                        確認メールを再送する
                    </Button>

                    {errorMessage !== "" && (
                        <Typography sx={{ color: "#dc2626", fontWeight: "bold" }}>
                            {errorMessage}
                        </Typography>
                    )}

                    {successMessage !== "" && (
                        <Typography sx={{ color: "text.secondary", fontWeight: "bold" }}>
                            {successMessage}
                        </Typography>
                    )}
                </Stack>
            </AuthLayout>
        );
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
                        fontSize: 12,
                        fontWeight: "bold",
                        lineHeight: 1.6,
                    }}
                >
                    ※メールアドレスは受信できるものを入力してください。
                    <br />
                    ※パスワードは6文字以上で入力してください。
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