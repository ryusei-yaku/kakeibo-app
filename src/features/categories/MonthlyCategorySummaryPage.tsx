import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    Box,
    Button,
    Container,
    Stack,
    Typography,
    Card,
    CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Expense } from "../../types/expense";
import dayjs from "dayjs";
import CategoryIcon from "@mui/icons-material/Category"

type MonthlyCategorySummaryPageProps = {
    expenses: Expense[];
}

//カテゴリー別に集計した結果の1件分の型
type CategorySummary = {
    id: string;
    name: string;
    amount: number;
}

//数値を「1,200円」のような表示用の文字列に変換する
function formatYen(amount: number) {
    return `${amount.toLocaleString()}円 `
}

function MonthlyCategorySummaryPage({
    expenses,
}: MonthlyCategorySummaryPageProps) {
    const navigate = useNavigate();
    //今日が含まれる年月を"2026-06"のような形式で取得する
    const currentMonth = dayjs().format("YYYY-MM");
    //全支出の中から、今月の日付の支出だけを取り出す
    const monthlyExpenses = expenses.filter((expense) =>
        expense.date.startsWith(currentMonth)
    );

    //今月の支出だけを、カテゴリーごとの合計金額にまとめる
    const monthlyCategorySummaries = monthlyExpenses.reduce<CategorySummary[]>(
        (summaries, expense) => {
            //すでに同じカテゴリーの集計データがあるか探す
            const existingSummary = summaries.find(
                (summary) => summary.id === expense.categoryId
            );

            //すでに同じカテゴリーがある場合は、そのカテゴリーの金額に加算する
            if (existingSummary) {
                existingSummary.amount += expense.amount;
                return summaries;
            }

            //まだそのカテゴリーがない場合は、新しいカテゴリー集計として追加する
            return [
                ...summaries,
                {
                    id: expense.categoryId,
                    name: expense.categoryName,
                    amount: expense.amount,
                },
            ];
        },

        //最初は空の配列から集計を始める
        []
    );

    //カテゴリー別合計を、金額が大きい順に並べ替える
    const sortedMonthlyCategorySummaries = [...monthlyCategorySummaries].sort(
        (a, b) => b.amount - a.amount //大きいものを前にする並び替え。
    );

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            <Container maxWidth="sm">
                <Stack spacing={2}>
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

                    <Box>
                        <Typography
                            variant="h5"
                            component="h1"
                            sx={{ fontWeight: "bold" }}
                        >
                            今月のカテゴリー別内訳
                        </Typography>

                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                            今月の支出をカテゴリーごとに確認します。
                        </Typography>

                        {/* 今月の支出が1件もない場合の表示 */}
                        {sortedMonthlyCategorySummaries.length === 0 ? (
                            <Typography color="text.secondary">
                                今月の支出はまだありません。
                            </Typography>
                        ) : (
                            //今月の支出がある場合は、カテゴリー別の合計を一覧表示する
                            <Stack spacing={1.5}>
                                {sortedMonthlyCategorySummaries.map((summary) => (
                                    <Card key={summary.id} sx={{ borderRadius: 3 }}>
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: 2,
                                                }}
                                            >
                                                {/* 左側：カテゴリー名 */}
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <CategoryIcon color="primary" />

                                                    <Typography sx={{ fontWeight: "bold" }}>
                                                        {summary.name}
                                                    </Typography>
                                                </Box>

                                                {/* 右側：そのカテゴリー合計金額 */}
                                                <Typography sx={{ fontWeight: "bold" }}>
                                                    {formatYen(summary.amount)}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

export default MonthlyCategorySummaryPage;