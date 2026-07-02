import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, Typography } from "@mui/material";
import dayjs from "../../../lib/dayjs";
import type { DailyExpenseGroup } from "../utils/expenseGrouping";

// DailyExpenseList が受け取るデータの型
type DailyExpenseListProps = {
    // 表示中の月（例：2026年7月）
    displayMonthText: string;

    // 表示中の月の収入合計
    displayMonthIncomeAmount: number;

    // 表示中の月の支出合計
    displayMonthExpenseAmount: number;

    // 表示中の月の収支
    // 収入 - 支出
    displayMonthBalanceAmount: number;

    groupedExpensesByDate: DailyExpenseGroup[];

    dailyExpenseSectionRefs: React.MutableRefObject<
        Record<string, HTMLDivElement | null>
    >;

    onExpenseClick: (expenseId: string) => void;
};

// 支出一覧に表示する詳細テキストを作る
// メモが両方ある場合は「店名（メモ）」の形にする
function formatExpenseDetail(memo: string) {
    if (memo !== "") {
        return memo;
    }
    return "";
}

function formatBalance(amount: number) {
    if (amount === 0) {
        return "0円";
    }

    const sign = amount > 0 ? "+" : "";
    return `${sign}${amount.toLocaleString()}円`;
}

function getBalanceColor(amount: number) {
    if (amount === 0) {
        return "text.secondary";
    }

    return amount > 0 ? "#2567eb" : "#dc2626";
}

function DailyExpenseList({
    displayMonthText,
    displayMonthIncomeAmount,
    displayMonthExpenseAmount,
    displayMonthBalanceAmount,
    groupedExpensesByDate,
    dailyExpenseSectionRefs,
    onExpenseClick,
}: DailyExpenseListProps) {
    return (
        <Box
            sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                backgroundColor: "#ffffff",
                borderRadius: 2,
                border: "1px solid #e0e0e0",
            }}
        >
            {/* 表示中の月の合計支出 */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid #eeeeee",
                    backgroundColor: "#ffffff",
                }}
            >
                <Typography
                    sx={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "text.secondary",
                        mb: 1,
                    }}
                >
                    {displayMonthText}の合計
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 1,
                    }}
                >
                    {/* 収入 */}
                    <Box>
                        <Typography
                            sx={{
                                fontSize: 12,
                                fontWeight: "bold",
                                color: "text.secondary",
                            }}
                        >
                            収入
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: "#2567eb",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {displayMonthIncomeAmount.toLocaleString()}円
                        </Typography>
                    </Box>

                    {/* 支出 */}
                    <Box>
                        <Typography
                            sx={{
                                fontSize: 12,
                                fontWeight: "bold",
                                color: "text.secondary",
                            }}
                        >
                            支出
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: "#dc2626",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {displayMonthExpenseAmount.toLocaleString()}円
                        </Typography>
                    </Box>

                    {/* 収支 */}
                    <Box>
                        <Typography
                            sx={{
                                fontSize: 12,
                                fontWeight: "bold",
                                color: "text.secondary",
                            }}
                        >
                            収支
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: getBalanceColor(displayMonthBalanceAmount),
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {formatBalance(displayMonthBalanceAmount)}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {groupedExpensesByDate.length === 0 ? (
                <Typography sx={{ p: 2, color: "text.secondary" }}>
                    {displayMonthText}の支出はまだありません。
                </Typography>
            ) : (
                groupedExpensesByDate.map((group) => (
                    <Box
                        component="div"
                        key={group.date}
                        ref={(element: HTMLDivElement | null) => {
                            // 日付ごとの支出一覧の位置を保存しておく
                            // カレンダーの日付を押したとき、この位置までスクロールするために使う
                            dailyExpenseSectionRefs.current[group.date] = element;
                        }}
                    >
                        {/* 日付ごとの見出し */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                justifyContent: "space-between",
                                backgroundColor: "#eeeeee",
                                px: 2,
                                py: 0.3,
                                minWidth: 0,
                                borderBottom: "1px solid #e5e0d8",
                            }}
                        >
                            {/* 日付は全文表示する */}
                            <Typography
                                sx={{
                                    flexShrink: 0,
                                    fontWeight: "bold",
                                    color: "#555555",
                                    fontSize: 14,
                                    whiteSpace: "nowrap",
                                    overflow: "visible",
                                    textOverflow: "clip",
                                }}
                            >
                                {dayjs(group.date).format("YYYY年M月D日(ddd)")}
                            </Typography>

                            {/* 金額は長い場合は省略する */}
                            <Typography
                                sx={{
                                    flex: 1,
                                    minWidth: 0,
                                    fontWeight: "bold",
                                    color: "#555555",
                                    fontSize: 14,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textAlign: "right",
                                }}
                            >
                               {formatBalance(group.balanceAmount)}
                            </Typography>
                        </Box>

                        {/* その日の支出明細 */}
                        {group.items.map((expense) => {
                            // 店名とメモを「店名（メモ）」の形に整える
                            const expenseDetail = formatExpenseDetail(expense.memo);

                            return (
                                <Box
                                    key={expense.id}
                                    onClick={() => onExpenseClick(expense.id)}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        px: 2,
                                        py: 1.25,
                                        borderBottom: "1px solid #eeeeee",
                                        minWidth: 0,
                                        backgroundColor: "#ffffff",
                                        cursor: "pointer",
                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                                        "&:hover": {
                                            backgroundColor: "#fff8ef",
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            minWidth: 0,
                                            flex: 1,
                                            mr: 1,
                                        }}
                                    >
                                        {/* カテゴリ名は折り返しも省略もせず、必ず全文表示する */}
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                whiteSpace: "nowrap",
                                                overflow: "visible",
                                                textOverflow: "clip",
                                            }}
                                        >
                                            {expense.categoryName}
                                        </Typography>

                                        {/* 店名（メモ）は長い場合、省略表示する */}
                                        {expenseDetail !== "" && (
                                            <Typography
                                                sx={{
                                                    fontSize: 12,
                                                    color: "text.secondary",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {expenseDetail}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            maxWidth: "45%",
                                            minWidth: 0,
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontWeight: "bold",
                                                fontSize: 18,
                                                minWidth: 0,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                textAlign: "right",
                                                color: expense.type === "income" ? "#2567eb" : "#dc2626",
                                            }}
                                        >
                                            {expense.amount.toLocaleString()}円
                                        </Typography>

                                        <ChevronRightIcon
                                            sx={{
                                                color: "text.secondary",
                                                flexShrink: 0,
                                            }}
                                        />
                                    </Box>
                                </Box>


                            );
                        })}
                    </Box>
                ))
            )}
        </Box>
    );
}

export default DailyExpenseList;