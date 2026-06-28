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
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import type { Expense } from "../../types/expense";

type HomePageProps = {
    expenses: Expense[];
}

const monthlyCategorySummaries = [
    { id: "food", name: "食費", amount: 18400 },
    { id: "daily", name: "日用品", amount: 7200 },
    { id: "transportation", name: "交通費", amount: 5600 },
    { id: "medical", name: "医療費", amount: 3000 },
];

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
        .filter((expense) => expense.date == today)
        //取り出した支出の金額を合計する
        .reduce((sum, expense) => sum + expense.amount, 0);

    const monthTotal = expenses
        .filter((expense) => expense.date.startsWith(currentMonth))
        .reduce((sum, expense) => sum + expense.amount, 0);

    function handleCategoryClick(categoryName: string, amount: number) {
        alert(`${categoryName}：${formatYen(amount)}の詳細を開きます`);
    }

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            <Container maxWidth="sm">
                <Stack spacing={3}>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{ fontWeight: "bold" }}
                        >
                            家計簿アプリ
                        </Typography>

                    </Box>

                    {/* 一時的に表示 */}
                    <Typography color="text.secondary">
                        登録件数：{expenses.length}件
                    </Typography>

                    <Card sx={{ borderRadius: 4 }}>
                        <CardContent>
                            <Typography color="text.secondary">今月使った金額</Typography>
                            <Typography
                                variant="h4"
                                sx={{ mt: 1, fontWeight: "bold" }}
                            >
                                {formatYen(monthTotal)}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ borderRadius: 4 }}>
                        <CardContent>
                            <Typography color="text.secondary">今日使った金額</Typography>
                            <Typography
                                variant="h4"
                                sx={{ mt: 1, fontWeight: "bold" }}
                            >
                                {formatYen(todayTotal)}
                            </Typography>
                        </CardContent>
                    </Card>

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
                        }}
                    >
                        支出を入力する
                    </Button>

                    <Stack spacing={1.5} sx={{ mt: 3 }}>
                        <Button
                            variant="outlined"
                            size="large"
                            fullWidth
                            startIcon={<CalendarMonthIcon />}
                            onClick={() => navigate("/calender")}
                            sx={{
                                py: 1.5,
                                borderRadius: 3,
                                fontWeight: "bold",
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
                                py: 1.5,
                                borderRadius: 3,
                                fontWeight: "bold",
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