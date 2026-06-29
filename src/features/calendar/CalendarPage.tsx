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
import { getDayColor, getOutsideMonthDayColor } from "./utils/calendarColors";
import {
    createCalendarDays,
    type CalendarDay,
} from "./utils/calendarDays";
import {
    calculateTotalAmount,
    createDailyExpenseTotals,
    filterExpensesByMonth,
    groupExpensesByDate,
    sortExpensesByDateDesc
} from "./utils/expenseGrouping";
import DailyExpenseList from "./components/DailyExpenseList";

// CalendarPageがApp.tsxから受け取るデータの型
type CalendarPageProps = {
    expenses: Expense[];
};

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

        //前月・翌月の日付なら、その日付が属する月へカレンダーを切り替える
        setDisplayMonth(dayjs(calendarDay.date).startOf("month"));

        //月の切り替え後に、その日付の支出一覧へスクロールするため予約しておく
        setPendingScrollDate(calendarDay.date);
    }

    // 日付ごとの支出合計を作る
    const dailyExpenseTotals = createDailyExpenseTotals(expenses);

    // 表示中の月に登録された支出だけを取り出す
    const displayMonthExpenses = filterExpensesByMonth(
        expenses,
        displayMonth.format("YYYY-MM")
    );

    //表示中の月の支出を、日付の新しい順に並べる
    const sortedDisplayMonthExpenses = sortExpensesByDateDesc(displayMonthExpenses);

    //表示中の月の支出合計を計算する
    const displayMonthTotalAmount = calculateTotalAmount(displayMonthExpenses);

    //表示中の月の支出を、日付ごとにまとめる
    const groupedExpensesByDate = groupExpensesByDate(sortedDisplayMonthExpenses);

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

    // 前月へ移動する
    function goToPreviousMonth() {
        setDisplayMonth((currentMonth) => currentMonth.subtract(1, "month"));
    }

    //翌月へ移動する
    function goToNextMonth() {
        setDisplayMonth((currentMonth) => currentMonth.add(1, "month"));
    }

    //表示中の月に対応するカレンダー日付マスを作る
    const calendarDays = createCalendarDays(displayMonth);

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
                                            <Typography sx={{ color: dayColor }}>
                                                {calendarDay.day}
                                            </Typography>
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

                    <DailyExpenseList
                        displayMonthText={displayMonth.format("YYYY年M月")}
                        displayMonthTotalAmount={displayMonthTotalAmount}
                        groupedExpensesByDate={groupedExpensesByDate}
                        dailyExpenseSectionRefs={dailyExpenseSectionRefs}
                    />
                </Stack>
            </Container>
        </Box>
    );
}

export default CalendarPage;