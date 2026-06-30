import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PieChartIcon from "@mui/icons-material/PieChart";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Stack,
    Typography
} from "@mui/material";
import dayjs from "../../lib/dayjs"
import { useNavigate } from "react-router-dom";
import type { Expense } from "../../types/expense";

type HomePageProps = {
    expenses: Expense[];
}

function formatYen(amount: number) {
    return `${amount.toLocaleString()}円`;
}

function HomePage({ expenses }: HomePageProps) {
    const navigate = useNavigate();

    //今日の日付作成
    const today = dayjs().format("YYYY-MM-DD");
    const currentMonth = dayjs().format("YYYY-MM");

    const todayTotal = expenses
        //今日の支出だけを取り出す
        .filter((expense) => expense.date === today)
        //取り出した支出の金額を合計する
        .reduce((sum, expense) => sum + expense.amount, 0);

    const monthTotal = expenses
        .filter((expense) => expense.date.startsWith(currentMonth))
        .reduce((sum, expense) => sum + expense.amount, 0);

    return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
        <Container maxWidth="sm">
            <Stack spacing={3}>
                {/* ヘッダー */}
                <Box>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: "bold",
                            color: "#333333",
                        }}
                    >
                        家計簿
                    </Typography>

                    <Typography
                        sx={{
                            mt: 0.5,
                            color: "text.secondary",
                            fontWeight: "bold",
                        }}
                    >
                        今日も無理なく記録しましょう
                    </Typography>
                </Box>

                {/* 今月・今日の支出カード */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        backgroundColor: "#fde7cd",
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.06)",
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontWeight: "bold",
                            }}
                        >
                            今月使った金額
                        </Typography>

                        <Typography
                            variant="h3"
                            sx={{
                                mt: 1,
                                fontWeight: "bold",
                                color: "#333333",
                                letterSpacing: 0.5,
                            }}
                        >
                            {formatYen(monthTotal)}
                        </Typography>

                        <Box
                            sx={{
                                mt: 2.5,
                                pt: 2,
                                borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "text.secondary",
                                    fontWeight: "bold",
                                }}
                            >
                                今日
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: 22,
                                    fontWeight: "bold",
                                    color: "#333333",
                                }}
                            >
                                {formatYen(todayTotal)}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* 支出入力ボタン */}
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate("/expenses/new")}
                    startIcon={<AddIcon />}
                    sx={{
                        py: 1.8,
                        borderRadius: 3,
                        fontSize: 18,
                        fontWeight: "bold",
                        backgroundColor: "#f59e0b",
                        boxShadow: "0 4px 12px rgba(245, 158, 11, 0.35)",
                        "&:hover": {
                            backgroundColor: "#d97706",
                        },
                    }}
                >
                    支出を入力する
                </Button>

                {/* メニュー */}
                <Stack spacing={1.5}>
                    <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        startIcon={<CalendarMonthIcon />}
                        onClick={() => navigate("/calendar")}
                        sx={{
                            justifyContent: "flex-start",
                            py: 1.6,
                            px: 2,
                            borderRadius: 3,
                            fontWeight: "bold",
                            backgroundColor: "#ffffff",
                            color: "#555555",
                            borderColor: "#f59e0b",
                            "&:hover": {
                                backgroundColor: "#fde7cd",
                                borderColor: "#d97706",
                            },
                        }}
                    >
                        カレンダーで見る
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        startIcon={<PieChartIcon />}
                        onClick={() => navigate("/categories/monthly")}
                        sx={{
                            justifyContent: "flex-start",
                            py: 1.6,
                            px: 2,
                            borderRadius: 3,
                            fontWeight: "bold",
                            backgroundColor: "#ffffff",
                            color: "#555555",
                            borderColor: "#f59e0b",
                            "&:hover": {
                                backgroundColor: "#fde7cd",
                                borderColor: "#d97706",
                            },
                        }}
                    >
                        今月の内訳をカテゴリー別で見る
                    </Button>
                </Stack>
            </Stack>
        </Container>
    </Box>
);
}

export default HomePage;