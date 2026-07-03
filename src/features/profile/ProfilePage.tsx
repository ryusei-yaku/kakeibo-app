import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import MailIcon from "@mui/icons-material/Mail";
import PersonIcon from "@mui/icons-material/Person";
import {
    Box,
    Button,
    Container,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type { User } from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type ProfilePageProps = {
    currentUser: User;
    displayName: string;
    onSaveDisplayName: (displayName: string) => Promise<void>;
    onLogout: () => void;
};

function ProfilePage({
    currentUser,
    displayName,
    onSaveDisplayName,
    onLogout,
}: ProfilePageProps) {
    // 前の画面へ戻るための関数
    const navigate = useNavigate();

    // 入力中のユーザー名を管理する
    const [editingDisplayName, setEditingDisplayName] = useState(displayName);

    async function handleSave() {
        // 前後の空白を取り除いて保存する
        await onSaveDisplayName(editingDisplayName.trim());

        // 保存後、ホーム画面へ戻る
        navigate("/");
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef" }}>
            <Box
                sx={{
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    backgroundColor: "#f6f4ef",
                    borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                }}
            >
                <Container maxWidth="sm">
                    <Button
                        onClick={() => navigate("/")}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            py: 1.2,
                            color: "text.secondary",
                            fontWeight: "bold",
                        }}
                    >
                        ホームへ戻る
                    </Button>
                </Container>
            </Box>
            <Container maxWidth="sm" sx={{ py: 2 }}>
                <Stack spacing={2.5}>

                    <Box>
                        <Typography
                            variant="h5"
                            component="h1"
                            sx={{ fontWeight: "bold", color: "#333333" }}
                        >
                            プロフィール
                        </Typography>

                        <Typography
                            sx={{
                                mt: 0.5,
                                color: "text.secondary",
                                fontWeight: "bold",
                            }}
                        >
                            アカウント情報を確認・変更できます。
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            backgroundColor: "#ffffff",
                            borderRadius: 4,
                            p: 2.5,
                            border: "1px solid #eeeeee",
                        }}
                    >
                        <Stack spacing={2}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <PersonIcon sx={{ color: "#f59e0b" }} />
                                <Typography sx={{ fontWeight: "bold" }}>
                                    ユーザー名
                                </Typography>
                            </Box>

                            <TextField
                                value={editingDisplayName}
                                onChange={(event) => setEditingDisplayName(event.target.value)}
                                placeholder="ユーザー"
                                fullWidth
                            />

                            <Button
                                variant="contained"
                                onClick={handleSave}
                                sx={{
                                    py: 1.3,
                                    borderRadius: 3,
                                    fontWeight: "bold",
                                    backgroundColor: "#f59e0b",
                                    "&:hover": {
                                        backgroundColor: "#d97706",
                                    },
                                }}
                            >
                                保存する
                            </Button>
                        </Stack>
                    </Box>

                    <Box
                        sx={{
                            backgroundColor: "#ffffff",
                            borderRadius: 4,
                            p: 2.5,
                            border: "1px solid #eeeeee",
                        }}
                    >
                        <Stack spacing={1.5}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <MailIcon sx={{ color: "#f59e0b" }} />
                                <Typography sx={{ fontWeight: "bold" }}>
                                    メールアドレス
                                </Typography>
                            </Box>

                            <Typography
                                sx={{
                                    color: "text.secondary",
                                    fontWeight: "bold",
                                    wordBreak: "break-all",
                                }}
                            >
                                {currentUser.email}
                            </Typography>
                            <Typography
                                sx={{
                                    color: "text.secondary",
                                }}
                            >
                                ※現在のバージョンではメールアドレスの変更はできません。
                            </Typography>
                        </Stack>
                    </Box>

                    <Button
                        variant="outlined"
                        color="error"
                        size="large"
                        startIcon={<LogoutIcon />}
                        onClick={onLogout}
                        sx={{
                            py: 1.4,
                            borderRadius: 3,
                            fontWeight: "bold",
                            backgroundColor: "#ffffff",
                        }}
                    >
                        ログアウト
                    </Button>
                </Stack>
            </Container>
        </Box>
    );
}

export default ProfilePage;