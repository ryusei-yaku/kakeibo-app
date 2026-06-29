import { isHoliday } from "@holiday-jp/holiday_jp";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
    Box,
    Button,
    Container,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "../../lib/dayjs";
import type { Expense } from "../../types/expense";

// CalendarPageがApp.tsxから受け取るデータの型
type CalendarPageProps = {
    expenses: Expense[];
};

//カレンダーに表示する1日分の情報
//前月・今月・翌月の日付を表示するため、isCurrentMonthで今月かどうかを区別する
type CalendarDay = {
    date: string;
    day: number;
    isCurrentMonth: boolean;
}

//曜日に応じて文字色を返す
//土曜日は青色、祝日と日曜日は赤色、それ以外は通常色にする
function getDayColor(date: string) {
    const dayOfWeek = dayjs(date).day();

    //祝日判定ライブラリに渡すため、"YYYY-MM-DD"をDateに変換する
    const dateObject = dayjs(date).toDate();

    if (isHoliday(dateObject) || dayOfWeek === 0) {
        return "#dc2626"
    }

    if (dayOfWeek === 6) {
        return "#2563eb";
    }

    return "#555555";
}

//今月以外の日付に使う文字色を返す
//土曜日は薄い青、日曜日・祝日は薄い赤色、それ以外は薄いグレーにする
function getOutsideMonthDayColor(date: string) {
    const dayOfWeek = dayjs(date).day();

    //祝日判定ライブラリに渡すため、"YYYY-MM-DD"をDateに変換する
    const dateObject = dayjs(date).toDate();

    if (isHoliday(dateObject) || dayOfWeek === 0) {
        return "#fca5a5";
    }

    if (dayOfWeek === 6) {
        return "#93c5fd";
    }

    return "#999999";
}

// 支出一覧に表示する詳細テキストを作る
// 店名とメモが両方ある場合は「店名（メモ）」の形にする
function formatExpenseDetail(shopName: string, memo: string) {
    if (shopName !== "" && memo !== "") {
        return `${shopName}（${memo}）`;
    }

    if (shopName !== "") {
        return shopName;
    }

    if (memo !== "") {
        return `（${memo}）`;
    }

    return "";
}

function CalendarPage({ expenses }: CalendarPageProps) {
    // ページ移動をするための関数を用意する
    const navigate = useNavigate();

    //表示中の月を管理する
    //初期値は今日が含まれる月にする
    const [displayMonth, setDisplayMonth] = useState(dayjs().startOf("month"));

    //カレンダー上で選択中の日付を管理する
    //初期値は今日の日付
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));

    //月を切り替えた後にスクロールしたい日付を一時的に保存する
    const [pendingScrollDate, setPendingScrollDate] = useState<string | null>(null);

    //日付ごとの一覧を覚えていくためのref
    const dailyExpenseSectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

    //カレンダーの日付を押したときに、下の支出一覧の該当日付まで移動する
    function scrollToExpenseDate(date: string) {
        const targetSection = dailyExpenseSectionRefs.current[date];

        //その日付の支出一覧がある場合だけスクロールする
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }

    //カレンダーの日付マスを押したときの処理
    function handleCalendarDayClick(calendarDay: CalendarDay) {
        //押した日付を選択中の日付として保存する
        setSelectedDate(calendarDay.date);

        //今月の日付なら、そのまま下の支出一覧へスクロールする
        if (calendarDay.isCurrentMonth) {
            scrollToExpenseDate(calendarDay.date);
            return;
        }

        //前月・翌日の日付なら、その日付が属する月へカレンダーを切り替える
        setDisplayMonth(dayjs(calendarDay.date).startOf("month"));

        //月の切り替え後に、その日付の支出一覧へスクロールするため予約しておく
        setPendingScrollDate(calendarDay.date);
    }

    // 日付ごとの支出合計を作る
    // カレンダーには前月・今月・翌月の日付も表示するため、
    // 今月の支出だけではなく、全支出から日付ごとの合計を作る
    const dailyExpenseTotals = expenses.reduce<Record<string, number>>(
        (totals, expense) => {
            // まだその日付の合計がない場合は0として扱う
            const currentTotal = totals[expense.date] ?? 0;

            return {
                ...totals,
                [expense.date]: currentTotal + expense.amount,
            };
        },
        {}
    );

    // 表示中の月に登録された支出だけを取り出す
    const displayMonthExpenses = expenses.filter((expense) =>
        expense.date.startsWith(displayMonth.format("YYYY-MM"))
    );

    //表示中の月の支出を、日付の新しい順に並べる
    const sortedDisplayMonthExpenses = [...displayMonthExpenses].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    );

    //表示中の月の支出合計を計算する
    const displayMonthTotalAmount = displayMonthExpenses.reduce(
        (total, expense) => total + expense.amount,
        0
    );

    //日付ごとに支出をまとめる
    const groupedExpensesByDate = sortedDisplayMonthExpenses.reduce<
        {
            date: string;
            totalAmount: number;
            items: Expense[];
        }[]
    >((groups, expense) => {
        const existingGroup = groups.find((group) => group.date === expense.date);

        if (existingGroup) {
            existingGroup.items.push(expense);
            existingGroup.totalAmount += expense.amount;
            return groups;
        }

        return [
            ...groups,
            {
                date: expense.date,
                totalAmount: expense.amount,
                items: [expense],
            },
        ];
    }, []);

    //前月・翌月の日付を押して月を切り替えた後、該当日付支出一覧へスクロールする
    useEffect(() => {
        if (pendingScrollDate === null) {
            return;
        }

        const targetSection = dailyExpenseSectionRefs.current[pendingScrollDate];

        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }

        //一度スクロールしたら予約を解除する
        setPendingScrollDate(null);
    }, [pendingScrollDate, groupedExpensesByDate]);

    //表示中の月の最初の日を取得する
    const startOfMonth = displayMonth.startOf("month");

    //表示中の月の最終日を取得する
    const endOfMonth = displayMonth.endOf("month");

    // 前月へ移動する
    function goToPreviousMonth() {
        setDisplayMonth((currentMonth) => currentMonth.subtract(1, "month"));
    }

    //翌月へ移動する
    function goToNextMonth() {
        setDisplayMonth((currentMont) => currentMont.add(1, "month"));
    }

    //今月が何日まであるかを取得する
    const daysInMonth = endOfMonth.date();

    //月初めが何曜日かを取得する
    // dayjsのday()は日=0, 月=1, ..., 土=6
    const firstDayOfWeek = startOfMonth.day();

    //月曜始まり用に、月初めの前に何個の空白マスが必要かを計算する
    //月曜なら0個、日曜なら6個
    const blankDaysBeforeMonth = (firstDayOfWeek + 6) % 7;

    //今月の1日の前に表示する、前月の日付マスを作る
    const previousMonthCalendarDays: CalendarDay[] = Array.from(
        { length: blankDaysBeforeMonth },
        (_, index) => {
            //前月の何日を表示するかを計算する
            const date = startOfMonth
                .subtract(blankDaysBeforeMonth - index, "day");

            return {
                date: date.format("YYYY-MM-DD"),
                day: date.date(),
                isCurrentMonth: false,
            };
        }
    );

    // 今月の日付マスを作る
    const currentMonthCalendarDays: CalendarDay[] = Array.from(
        { length: daysInMonth },
        (_, index) => {
            const day = index + 1;

            // 比較や表示に使う日付文字列を作る
            const date = startOfMonth.date(day).format("YYYY-MM-DD");

            return {
                date,
                day,
                isCurrentMonth: true,
            };
        }
    );

    // 前月分のマス + 今月の日数の合計を計算する
    const usedCalendarCellCount =
        previousMonthCalendarDays.length + currentMonthCalendarDays.length;

    // 35マスで収まる月は5週間分、収まらない月は6週間分で表示する
    const totalCalendarCellCount = usedCalendarCellCount <= 35 ? 35 : 42;

    // 今月の日付と前月の日付を入れたあと、残り何マス必要か計算する
    const nextMonthDaysCount =
        totalCalendarCellCount -
        previousMonthCalendarDays.length -
        currentMonthCalendarDays.length;

    // 今月の最後の日の後に表示する、翌月の日付マスを作る
    const nextMonthCalendarDays: CalendarDay[] = Array.from(
        { length: nextMonthDaysCount },
        (_, index) => {
            // 翌月の1日、2日、3日...を作る
            const date = endOfMonth.add(index + 1, "day");

            return {
                date: date.format("YYYY-MM-DD"),
                day: date.date(),
                isCurrentMonth: false,
            };
        }
    );

    //空白マスと今月の日付マスを結合して、カレンダーに表示する配列を作る
    const calendarDays: CalendarDay[] = [
        ...previousMonthCalendarDays,
        ...currentMonthCalendarDays,
        ...nextMonthCalendarDays,
    ];

    //カレンダー上部に表示する曜日
    const weekdays = ["月", "火", "水", "木", "金", "土", "日"]

    return (
        // 画面全体の背景と高さを設定する
        <Box
            sx={{
                height: "100dvh",
                backgroundColor: "#f6f4ef",
                py: 1,
                overflow: "hidden",
            }}
        >
            {/* スマホで見やすい横幅に制限する */}
            <Container maxWidth="sm" sx={{ height: "100%" }}>
                {/* 画面内の要素を縦方向に間隔を空けて並べる */}
                <Stack spacing={1} sx={{ height: "100%", minHeight: 0 }}>
                    <Box sx={{ flexShrink: 0 }}>
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
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1,
                            }}
                        >
                            {/* カレンダー画面であることを分かりやすくするアイコン */}
                            {/* <CalendarMonthIcon sx={{ color: "#f59e0b" }} /> */}

                            {/* ページタイトル */}
                            {/* <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
                                カレンダー
                            </Typography> */}
                        </Box>

                        {/* 表示中の月を切り替えるエリア */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            {/* 前月へ移動するボタン */}
                            <IconButton
                                onClick={goToPreviousMonth}
                                aria-label="前月へ移動"
                                sx={{ color: "text.secondary" }}
                            >
                                <ChevronLeftIcon />
                            </IconButton>

                            {/* 現在表示している年月 */}
                            <Box
                                sx={{
                                    flex: 1,
                                    backgroundColor: "#fde7cd",
                                    borderRadius: 2,
                                    py: 0,
                                    textAlign: "center",
                                }}
                            >
                                <Typography sx={{ fontWeight: "bold", fontSize: 22, color: "#666666" }}>
                                    {displayMonth.format("YYYY年M月")}
                                </Typography>
                            </Box>

                            {/* 次月へ移動するボタン */}
                            <IconButton
                                onClick={goToNextMonth}
                                aria-label="次月へ移動"
                                sx={{ color: "text.secondary" }}
                            >
                                <ChevronRightIcon />
                            </IconButton>
                        </Box>

                        {/* カレンダー全体の箱 */}
                        <Box
                            sx={{
                                backgroundColor: "#ffffff",
                                borderRadius: 3,
                                overflow: "hidden",
                                border: "1px solid #d9d9d9",
                            }}
                        >
                            {/* 曜日の見出し */}
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(7, 1fr)",
                                    backgroundColor: "#f59e0b",
                                    borderBottom: "1px solid #d9d9d9",
                                }}>
                                {weekdays.map((weekday) => {
                                    //曜日の見出しの文字色を決める
                                    const color =
                                        weekday === "土"
                                            ? "#2563eb"
                                            : weekday === "日"
                                                ? "#dc2626"
                                                : "#ffffff";

                                    return (
                                        <Typography
                                            key={weekday}
                                            sx={{
                                                textAlign: "center",
                                                fontSize: 14,
                                                color,
                                                py: 1,
                                                borderRight:
                                                    weekday === "日" ? "none" : "1px solid rgba(255,255,255,0.35)",
                                            }}
                                        >
                                            {weekday}
                                        </Typography>
                                    );
                                })}
                            </Box>

                            {/* 日付のマス目 */}
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",

                                }}
                            >
                                {calendarDays.map((calendarDay, index) => {
                                    //日付の文字色を決める
                                    //今月以外の日付は薄い色にする
                                    const dayColor = calendarDay.isCurrentMonth
                                        ? getDayColor(calendarDay.date)
                                        : getOutsideMonthDayColor(calendarDay.date);

                                    //この日付に登録された支出合計を取得する
                                    //合計がない日付の場合はundefinedになる
                                    const dailyTotal = dailyExpenseTotals[calendarDay.date];

                                    // このマスの日付が選択中の日付かどうかを判定する
                                    const isSelectedDate = calendarDay.date === selectedDate;

                                    return (
                                        <Box
                                            key={calendarDay.date}
                                            onClick={() => handleCalendarDayClick(calendarDay)}
                                            sx={{
                                                // 縦幅固定
                                                height: 58,
                                                // 中身が長くてもマスの横幅を広げない
                                                minWidth: 0,
                                                //選択中のマスは薄いオレンジにする
                                                //今月以外の日付は薄いグレー、それ以外は白にする
                                                backgroundColor: isSelectedDate
                                                    ? "#fde7cd"
                                                    : calendarDay.isCurrentMonth
                                                        ? "#ffffff"
                                                        : "#f3f3f3",
                                                p: 0.75,
                                                textAlign: "left",
                                                //右端の列以外に右線を引く
                                                borderRight: index % 7 === 6 ? "none" : "1px solid #d9d9d9",
                                                //各行の下に線を引く
                                                borderBottom: "1px solid #d9d9d9",
                                                cursor: "pointer",
                                                //マスからはみ出した内容は表示しない
                                                overflow: "hidden",
                                                //padding込みでheightに収める
                                                boxSizing: "border-box",
                                            }}
                                        >
                                            {/* 日付を表示する */}
                                            {calendarDay.day !== null && (
                                                <Typography sx={{ color: dayColor }}>
                                                    {calendarDay.day}
                                                </Typography>
                                            )}
                                            {/* その日に支出がある場合だけ、日付マスの中に合計金額を表示する */}
                                            {dailyTotal !== undefined && (
                                                <Typography
                                                    sx={{
                                                        mt: 0.5,
                                                        fontSize: 10,
                                                        fontWeight: "bold",
                                                        color: calendarDay.isCurrentMonth ? "#dc2626" : "#fca5a5",
                                                        textAlign: "right",

                                                        //親の幅を超えない
                                                        maxWidth: "100%",
                                                        minWidth: 0,

                                                        //金額が長い場合は折り返さず、「1,234...」のように省略する
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",

                                                        // Typographyを横幅制御しやすい表示にする
                                                        display: "block",
                                                    }}
                                                >
                                                    {dailyTotal.toLocaleString()}
                                                </Typography>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Box>

                    {/* 表示中の月の支出一覧 */}
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            overflowY: "auto",
                            backgroundColor: "#ffffff",
                            borderRadius: 2,
                            border: "1px solid #e0e0e0"
                        }}
                    >
                        {/* 表示中の月の合計支出 */}
                        <Box
                            sx={{
                                px: 2,
                                py: 1.5,
                                borderBottom: "1px solid #eeeeee",
                                backgroundColor: "#fff8ef",
                            }}
                        >

                            <Typography
                                sx={{
                                    fontSize: 22,
                                    fontWeight: "bold",
                                    color: "#dc2626",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textAlign: "right",
                                }}
                            >
                                支出合計{displayMonthTotalAmount.toLocaleString()}円
                            </Typography>
                        </Box>

                        {groupedExpensesByDate.length === 0 ? (
                            <Typography sx={{ p: 2, color: "text.secondary" }}>
                                この月の支出はまだありません。
                            </Typography>
                        ) : (
                            groupedExpensesByDate.map((group) => (
                                <Box
                                    component="div"
                                    key={group.date}
                                    ref={(element: HTMLDivElement | null) => {
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
                                            py: 0.75,
                                            minWidth: 0,
                                        }}
                                    >
                                        {/* 日付は全文表示する */}
                                        <Typography
                                            sx={{
                                                flexShrink: 0,
                                                fontWeight: "bold",
                                                color: "#555555",
                                                white: "nowrap",
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
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                textAlign: "right",
                                            }}
                                        >
                                            -{group.totalAmount.toLocaleString()}円
                                        </Typography>
                                    </Box>

                                    {/* その日の支出明細 */}
                                    {group.items.map((expense) => {
                                        // 店名とメモを「店名（メモ）」の形に整える
                                        const expenseDetail = formatExpenseDetail(expense.shopName, expense.memo);

                                        return (
                                            <Box
                                                key={expense.id}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    px: 2,
                                                    py: 1.5,
                                                    borderBottom: "1px solid #eeeeee",
                                                    minWidth: 0,
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

                                                {/* 金額は長い場合、省略表示する */}
                                                <Typography
                                                    sx={{
                                                        fontWeight: "bold",
                                                        fontSize: 18,
                                                        maxWidth: "45%",
                                                        minWidth: 0,
                                                        flexShrink: 1,
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow: "ellipsis",
                                                        textAlign: "right",
                                                    }}
                                                >
                                                    {expense.amount.toLocaleString()}円
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ))
                        )}
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

export default CalendarPage;