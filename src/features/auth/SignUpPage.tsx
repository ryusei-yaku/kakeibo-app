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

            console.log("新規登録成功", userCredential.user.email);

            // 確認メールを再送できるように、新規登録したユーザー情報を保存する
            setRegisteredUser(userCredential.user);

            console.log("確認メール送信前");

            // 新規登録したユーザー宛に確認メールを送信する
            await sendVerificationEmail(userCredential.user);

            console.log("確認メール送信成功");

            // 確認メール送信後は、送信完了画面を表示する
            setIsVerificationEmailSent(true);

        } catch (error) {
            // 確認メール送信や新規登録で何が失敗したか確認する
            console.error("新規登録または確認メール送信に失敗しました", error);

            setErrorMessage("新規登録または確認メール送信に失敗しました。メールアドレスやパスワードを確認してください。");
        } finally {
            setIsLoading(false);
        }
    }
    if (isVerificationEmailSent) {
        return (
            <AuthLayout
                title="確認メールを送信しました"
                description="登録したメールアドレス宛に確認メールを送信しました。メール内のリンクを開いて、登録を完了してください。"
            >
                <Stack spacing={2}>
                    <Typography
                        sx={{
                            color: "text.secondary",
                            fontWeight: "bold",
                            lineHeight: 1.7,
                        }}
                    >
                        メール確認後、ログイン画面からログインしてください。
                        <br />
                        メールが届かない場合は、迷惑メールフォルダも確認してください。
                    </Typography>

                    <Button
                        variant="outlined"
                        size="large"
                        onClick={async () => {
                            setErrorMessage("");

                            try {
                                if (registeredUser === null) {
                                    setErrorMessage("確認メールを再送できませんでした。もう一度新規登録をお試しください。");
                                    return;
                                }

                                // 新規登録したユーザー宛に確認メールをもう一度送信する
                                await sendVerificationEmail(registeredUser);
                            } catch {
                                setErrorMessage("確認メールの再送信に失敗しました。時間をおいて再度お試しください。");
                            }
                        }}
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
                        確認メールを再送する
                    </Button>

                    {errorMessage !== "" && (
                        <Typography sx={{ color: "#dc2626", fontWeight: "bold" }}>
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