import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import dayjs from "../../lib/dayjs";
import {
    useNavigate,
    useParams,
    useSearchParams
} from "react-router-dom";
import type { Expense } from "../../types/expense";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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
function formatExpenseLabel(memo: string) {
    if (memo !== "") {
        return memo;
    }

    return "メモなし";
}

function MonthlyCategoryDetailPage({
    expenses,
}: MonthlyCategoryDetailPageProps) {
    //URLの「:categoryId」に入っている値を取得する
    const { transactionType, categoryId } = useParams();

    // URLのtransactionTypeがincomeのときだけ収入として扱う
    const selectedTransactionType =
        transactionType === "income" ? "income" : "expense";

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // 一覧画面から渡された月を取得する
    // monthがない場合は現在の月を表示する
    const selectedMonth =
        searchParams.get("month") ?? dayjs().format("YYYY-MM");

    // 画面表示用に「2026年7月」の形式へ変換する
    const selectedMonthLabel = dayjs(selectedMonth).format("YYYY年M月");

    //全支出の中から、今月かつURLのcategoryIdと一致する支出だけを取り出す
    const categoryMonthlyExpenses = expenses.filter(
        (expense) =>
            expense.date.startsWith(selectedMonth) &&
            expense.categoryId === categoryId &&
            expense.type === selectedTransactionType
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
                        onClick={() =>
                            navigate(`/categories/monthly?month=${selectedMonth}`)
                        }
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            alignSelf: "flex-start",
                            color: "text.secondary",
                            fontWeight: "bold",
                        }}
                    >
                        カテゴリー別内訳へ戻る
                    </Button>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            variant="h5"
                            component="h1"
                            sx={{
                                fontWeight: "bold",
                                color: "#333333",
                                wordBreak: "break-word",
                            }}
                        >
                            {selectedMonthLabel}の{categoryName}の
                            {selectedTransactionType === "expense" ? "支出" : "収入"}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                            このカテゴリーで登録した
                            {transactionType === "expense"
                                ? "支出"
                                : "収入"
                            }
                            を確認します。
                        </Typography>
                    </Box>

                    {/* このカテゴリーの選択した月の支出が1件もない場合 */}

                    {groupedExpensesByDate.length === 0 ? (
                        <Typography color="text.secondary">
                            {selectedMonthLabel}の
                            {selectedTransactionType === "expense"
                                ? "支出"
                                : "収入"
                            }
                            はまだありません。
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
                                                onClick={() => navigate(`/expenses/edit/${expense.id}`)}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    gap: 2,
                                                    px: 2,
                                                    py: 1.5,
                                                    borderTop: index === 0 ? "none" : "1px solid #eeeeee",
                                                    cursor: "pointer",
                                                    "&:hover": {
                                                        backgroundColor: "#fff8ef"
                                                    }
                                                }}
                                            >
                                                {/* 左側：店名。メモがあれば店名の横に（）で表示 */}
                                                <Typography sx={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    pr: 2,
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                                >
                                                    {formatExpenseLabel(expense.memo)}
                                                </Typography>

                                                {/* 右側：金額 */}
                                                <Box sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                    flexShrink: 0,
                                                }}>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: "bold",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {formatYen(expense.amount)}
                                                    </Typography>

                                                    <ChevronRightIcon
                                                        sx={{
                                                            color: "text.secondary",
                                                            flexShrink: 0,
                                                        }} />
                                                </Box>
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