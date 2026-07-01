import AddIcon from "@mui/icons-material/Add";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
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
import { useNavigate } from "react-router-dom";
import dayjs from "../../lib/dayjs";
import type { Expense } from "../../types/expense";

type HomePageProps = {
    expenses: Expense[];
}

function formatYen(amount: number) {
    return `${amount.toLocaleString()}円`;
}

function formatBalance(amount: number) {
    const sign = amount >= 0 ? "+" : "";
    return `${sign}${amount.toLocaleString()}円`;
}

function HomePage({ expenses }: HomePageProps) {
    const navigate = useNavigate();

    const currentMonth = dayjs().format("YYYY-MM");

    // 今月の支出合計を計算する
    const monthExpenseTotal = expenses
        .filter(
            (expense) =>
                expense.date.startsWith(currentMonth) &&
                expense.type === "expense"
        )
        .reduce((sum, expense) => sum + expense.amount, 0);

    // 今月の収入合計を計算する
    const monthIncomeTotal = expenses
        .filter(
            (expense) =>
                expense.date.startsWith(currentMonth) &&
                expense.type === "income"
        )
        .reduce((sum, expense) => sum + expense.amount, 0);

    // 今月の収支を計算する
    const monthBalance = monthIncomeTotal - monthExpenseTotal;

    // 収支がプラスなら青、マイナスなら赤にする
    const balanceColor = monthBalance >= 0 ? "#2592eb" : "#dc2626"

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
                            家計簿アプリ
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
                                今月の収支
                            </Typography>

                            <Typography
                                variant="h3"
                                sx={{
                                    mt: 1,
                                    fontWeight: "bold",
                                    color: balanceColor,
                                    letterSpacing: 0.5,
                                }}
                            >
                                {formatBalance(monthBalance)}
                            </Typography>

                            <Stack
                                spacing={1.2}
                                sx={{
                                    mt: 2.5,
                                    pt: 2,
                                    borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                                }}
                            >
                                {/* 今月の収入 */}
                                <Box
                                    sx={{
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
                                        今月の収入
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: 20,
                                            fontWeight: "bold",
                                            color: "#2592eb",
                                        }}
                                    >
                                        {formatYen(monthIncomeTotal)}
                                    </Typography>
                                </Box>

                                {/* 今月の支出 */}
                                <Box
                                    sx={{
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
                                        今月の支出
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: 20,
                                            fontWeight: "bold",
                                            color: "#dc2626",
                                        }}
                                    >
                                        {formatYen(monthExpenseTotal)}
                                    </Typography>
                                </Box>

                            </Stack>
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
                            py: 1.2,
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
                        入力する
                    </Button>

                    {/* メニュー */}
                    <Stack spacing={1.5}>
                        <Button
                            variant="outlined"
                            size="large"
                            fullWidth
                            startIcon={<CalendarMonthIcon sx={{ color: "#f59e0b" }} />}
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
                                textTransform: "none",
                                "&:hover": {
                                    backgroundColor: "#fde7cd",
                                    borderColor: "#d97706",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                }}
                            >
                                <span>カレンダーで見る</span>
                                <ChevronRightIcon sx={{ color: "#f59e0b" }} />
                            </Box>
                        </Button>

                        <Button
                            variant="outlined"
                            size="large"
                            fullWidth
                            startIcon={<PieChartIcon sx={{ color: "#f59e0b" }} />}
                            onClick={() => navigate("/categories/monthly")}
                            sx={{
                                justifyContent: "flex-start",
                                py: 1.6,
                                px: 2,
                                borderRadius: 3,
                                fontWeight: "bold",
                                backgroundColor: "#ffffff",
                                color: "#555555",
                                textTransform: "none",
                                borderColor: "#f59e0b",
                                "&:hover": {
                                    backgroundColor: "#fde7cd",
                                    borderColor: "#d97706",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    width: "100%",
                                }}
                            >
                                <div>今月の内訳をカテゴリー別で見る</div>
                                <ChevronRightIcon sx={{ color: "#f59e0b" }} />
                            </Box>
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}

export default HomePage;