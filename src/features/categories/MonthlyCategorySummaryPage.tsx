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
import dayjs from "../../lib/dayjs";
import CategoryIcon from "@mui/icons-material/Category";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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
    return `${amount.toLocaleString()}円`
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

    const chartColors = [
        "#f59e0b", // オレンジ
        "#2563eb", // 青
        "#ff6ab4", // ピンク
        "#16a34a", // 緑
        "#7c3aed", // 紫
        "#64748b", // グレー
        "#dc2626", // 赤
        "#0891b2", // シアン
        "#92400e", // ブラウン
        "#65a30d", // 黄緑
        "#4338ca", // 藍色
        "#ca8a04", // 濃い黄色
    ];

    const monthlyTotalAmount = monthlyExpenses.reduce(
        (total, expense) => total + expense.amount,
        0
    );

    //円グラフ用のデータ作成
    const categoryChartItems = sortedMonthlyCategorySummaries.map(
        (summary, index) => {
            const percentage =
                monthlyTotalAmount === 0
                    ? 0
                    : Math.round((summary.amount / monthlyTotalAmount) * 100);

            return {
                ...summary,
                percentage,
                color: chartColors[index % chartColors.length],
            };
        }
    );

    //conic-gradient用の文字列作成
    let currentPercentage = 0;

    const pieChartGradient =
        categoryChartItems.length === 0
            ? "#eeeeee"
            : categoryChartItems
                .map((item) => {
                    const start = currentPercentage;
                    const end = currentPercentage + item.percentage;

                    currentPercentage = end;

                    return `${item.color} ${start}% ${end}%`;
                })
                .join(", ");

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            <Container maxWidth="sm">
                <Stack spacing={2.5}>
                    <Button
                        onClick={() => navigate("/")}
                        startIcon={<ArrowBackIcon sx={{ color: "text.secondary" }} />}
                        sx={{
                            alignSelf: "flex-start",
                            color: "text.secondary",
                            fontWeight: "bold",
                        }}
                    >
                        ホームへ戻る
                    </Button>

                    {/* ヘッダー */}
                    <Box>
                        <Typography
                            variant="h5"
                            component="h1"
                            sx={{
                                fontWeight: "bold",
                                color: "#333333",
                            }}
                        >
                            今月のカテゴリー別内訳
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 0.5,
                                fontWeight: "bold",
                            }}>
                            今月の支出をカテゴリーごとに確認します。
                        </Typography>
                    </Box>

                    {/* カテゴリー割合グラフ */}
                    <Box
                        sx={{
                            backgroundColor: "#ffffff",
                            borderRadius: 4,
                            p: 2.5,
                            border: "1px solid #eeeeee",
                            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                        }}
                    >
                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontWeight: "bold",
                                mb: 2,
                            }}
                        >
                            カテゴリー別の割合
                        </Typography>

                        {categoryChartItems.length === 0 ? (
                            <Typography color="text.secondary">
                                表示できる支出がまだありません。
                            </Typography>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                }}
                            >
                                {/* 円グラフ */}
                                <Box
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: "50%",
                                        background: `conic-gradient(${pieChartGradient})`,
                                        flexShrink: 0,
                                        boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.04)",
                                    }}
                                />

                                {/* 凡例 */}
                                <Stack spacing={0.8} sx={{ flex: 1, minWidth: 0 }}>
                                    {categoryChartItems.map((item) => (
                                        <Box
                                            key={item.id}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                minWidth: 0,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: "50%",
                                                    backgroundColor: item.color,
                                                    flexShrink: 0,
                                                }}
                                            />

                                            <Typography
                                                sx={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    fontSize: 14,
                                                    fontWeight: "bold",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {item.name}
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontSize: 14,
                                                    fontWeight: "bold",
                                                    color: "text.secondary",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {item.percentage}%
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Box>

                    {/* 今月合計カード */}
                    <Box
                        sx={{
                            backgroundColor: "#fde7cd",
                            borderRadius: 4,
                            p: 2.5,
                            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.06)",
                        }}
                    >
                        <Typography
                            sx={{
                                color: "text.secondary",
                                fontWeight: "bold",
                            }}
                        >
                            今月の支出合計
                        </Typography>

                        <Typography
                            variant="h4"
                            sx={{
                                mt: 1,
                                fontWeight: "bold",
                                color: "#333333",
                            }}
                        >
                            {formatYen(monthlyTotalAmount)}
                        </Typography>
                    </Box>


                    {/* 今月の支出が1件もない場合の表示 */}

                    {sortedMonthlyCategorySummaries.length === 0 ? (
                        <Box
                            sx={{
                                backgroundColor: "#ffffff",
                                borderRadius: 3,
                                p: 2,
                                border: "1px solid #eeeeee",
                            }}
                        >
                            <Typography color="text.secondary">
                                今月の支出はまだありません。
                            </Typography>
                        </Box>
                    ) : (
                        //今月の支出がある場合は、カテゴリー別の合計を一覧表示する
                        <Stack spacing={1.5}>
                            {sortedMonthlyCategorySummaries.map((summary) => (
                                <Card
                                    key={summary.id}
                                    elevation={0}
                                    //カテゴリーカードを押したら、そのカテゴリーカードの今月詳細ページへ移動する。
                                    onClick={() => navigate(`/categories/monthly/${summary.id}`)}
                                    sx={{
                                        borderRadius: 3,
                                        backgroundColor: "#ffffff",
                                        border: "1px solid #eeeeee",
                                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                                        cursor: "pointer",
                                        "&:hover": {
                                            backgroundColor: "#fff8ef",
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2 }}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                minWidth: 0,
                                            }}
                                        >
                                            {/* 左側：アイコン */}
                                            <CategoryIcon
                                                sx={{
                                                    color: "#f59e0b",
                                                    flexShrink: 0,
                                                }}
                                            />
                                            {/* 中央：カテゴリー名 */}
                                            <Typography
                                                sx={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    fontWeight: "bold",
                                                    color: "#333333",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}>
                                                {summary.name}
                                            </Typography>


                                            {/* 右側：金額と遷移アイコン */}
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: "bold",
                                                        color: "#333333",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {formatYen(summary.amount)}
                                                </Typography>

                                                <ChevronRightIcon
                                                    sx={{
                                                        color: "text.secondary",
                                                        flexShrink: 0,
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Container>
        </Box >
    );
}

export default MonthlyCategorySummaryPage;