import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
    Box,
    Button,
    Container,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function CalendarPage() {
    // ページ移動をするための関数を用意する
    const navigate = useNavigate();

    return (
        // 画面全体の背景と高さを設定する
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            {/* スマホで見やすい横幅に制限する */}
            <Container maxWidth="sm">
                {/* 画面内の要素を縦方向に間隔を空けて並べる */}
                <Stack spacing={2}>
                    {/* ホーム画面に戻るボタン */}
                    <Button
                        onClick={() => navigate("/")}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            alignSelf: "flex-start",
                            color: "text.secondary",
                            fontWeight: "bold",
                        }}
                    >
                        ホームへ戻る
                    </Button>

                    {/* ページタイトル行 */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {/* カレンダー画面であることを分かりやすくするアイコン */}
                        <CalendarMonthIcon color="primary" />

                        {/* ページタイトル */}
                        <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
                            カレンダー
                        </Typography>
                    </Box>

                    {/* このページで何ができるかを説明する文 */}
                    <Typography color="text.secondary">
                        今月の支出を日付ごとに確認します。
                    </Typography>
                </Stack>
            </Container>
        </Box>
    );
}

export default CalendarPage;