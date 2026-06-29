import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import dayjs from "../../lib/dayjs";
import { useNavigate, useParams } from "react-router-dom";
import type { Expense } from "../../types/expense";

type MonthlyCategoryDetailPageProps = {
    expenses: Expense[];
}

//同じ日付の支出をまとめるための型
type DailyExpenseGroup = {
    date: string;
    totalAmount: number;
    items: Expense[];
}
// 数値を「1,200円」のような表示用文字列に変換する
function formatYen(amount: number) {
    return `${amount.toLocaleString()}円`;
}
// "2026-06-28" のような日付文字列を「2026年6月28日(日)」の表示に変換する
function formatDateWithWeekday(date: string) {
    return dayjs(date).format("YYYY年M月D日(ddd)");
}

//支出1件の左側に表示する文字列を作る
//店名があれば店名を表示し、メモがあれば店名の横に（）で表示する
function formatExpenseLabel(shopName: string, memo: string) {
    if (shopName !== "" && memo !== "") {
        return `${shopName} (${memo})`;
    }

    if (shopName !== "") {
        return shopName;
    }

    if (memo !== "") {
        return `(${memo})`;
    }
}

function MonthlyCategoryDetailPage({
    expenses,
}: MonthlyCategoryDetailPageProps) {
    //URLの「:categoryId」に入っている値を取得する
    const { categoryId } = useParams();
    //今日が含まれる年月を"2026-06"のような形式で取得する
    const currentMonth = dayjs().format("YYYY-MM");
    const navigate = useNavigate();

    //全支出の中から、今月かつURLのcategoryIdと一致する支出だけを取り出す
    const categoryMonthlyExpenses = expenses.filter(
        (expense) =>
            expense.date.startsWith(currentMonth) &&
            expense.categoryId === categoryId
    );

    //選択中カテゴリーの今月支出を、日付の新しい順に並べる
    const sortedCategoryMonthlyExpenses = [...categoryMonthlyExpenses].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    )

    //同じ日付の支出を1つのグループにまとめる
    const groupedExpensesByDate = sortedCategoryMonthlyExpenses.reduce<
        DailyExpenseGroup[]
    >((groups, expense) => {
        //すでに同じ日付のグループがあるか探す
        const existingGroup = groups.find((group) => group.date === expense.date);

        //同じ日付のグループがある場合には、そのグループの支出を追加する
        if (existingGroup) {
            existingGroup.items.push(expense);
            existingGroup.totalAmount += expense.amount;
            return groups;
        }

        //まだ同じ日付のグループがない場合は新しく日付グループを作る
        return [
            ...groups,
            {
                date: expense.date,
                totalAmount: expense.amount,
                items: [expense],
            }
        ]
    }, [])

    //表示用のカテゴリー名を取得する
    //支出が1件以上あれば、その支出に保存されているcategoryNameを使う
    const categoryName =
        categoryMonthlyExpenses.length > 0
            ? categoryMonthlyExpenses[0].categoryName
            : "カテゴリー";

    return (
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            <Container maxWidth="sm">
                <Stack spacing={2}>
                    <Button
                        onClick={() => navigate("/categories/monthly")}
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            alignSelf: "flex-start",
                            color: "text.secondary",
                            fontWeight: "bold",
                        }}
                    >
                        内訳へ戻る
                    </Button>

                    <Box>
                        <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
                            {categoryName}の今月の支出
                        </Typography>

                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                            このカテゴリーで登録した支出を確認します。
                        </Typography>
                    </Box>

                    {/* このカテゴリーの今月支出が1件もない場合 */}

                    {groupedExpensesByDate.length === 0 ? (
                        <Typography color="text.secondary">
                            今月の支出はまだありません。
                        </Typography>
                    ) : (
                        // 支出がある場合は、日付ごとにまとめて表示する
                        <Stack spacing={2}>
                            {groupedExpensesByDate.map((group) => (
                                <Box key={group.date}>
                                    {/* 日付ごとの見出し行 */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            px: 2,
                                            py: 1,
                                            backgroundColor: "#e5e1da",
                                            borderTopLeftRadius: 12,
                                            borderTopRightRadius: 12,
                                        }}
                                    >
                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {formatDateWithWeekday(group.date)}
                                        </Typography>

                                        <Typography sx={{ fontWeight: "bold" }}>
                                            {formatYen(group.totalAmount)}
                                        </Typography>
                                    </Box>

                                    {/* その日付に属する支出一覧 */}
                                    <Box
                                        sx={{
                                            backgroundColor: "#ffffff",
                                            borderBottomLeftRadius: 12,
                                            borderBottomRightRadius: 12,
                                            overflow: "hidden",
                                        }}
                                    >
                                        {group.items.map((expense, index) => (
                                            <Box
                                                key={expense.id}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    gap: 2,
                                                    px: 2,
                                                    py: 1.5,
                                                    borderTop: index === 0 ? "none" : "1px solid #eeeeee",
                                                }}
                                            >
                                                {/* 左側：店名。メモがあれば店名の横に（）で表示 */}
                                                <Typography sx={{ pr: 2 }}>
                                                    {formatExpenseLabel(expense.shopName, expense.memo)}
                                                </Typography>

                                                {/* 右側：金額 */}
                                                <Typography
                                                    sx={{
                                                        fontWeight: "bold",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    {formatYen(expense.amount)}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}

export default MonthlyCategoryDetailPage;