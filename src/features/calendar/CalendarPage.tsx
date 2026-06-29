import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    Box,
    Button,
    Container,
    Stack,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "../../lib/dayjs";
import type { Expense } from "../../types/expense";
import CalendarGrid from "./components/CalendarGrid";
import DailyExpenseList from "./components/DailyExpenseList";
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
import CalendarMonthHeader from "./components/CalendarMonthHeader";

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

                        <CalendarMonthHeader 
                        displayMonthText={displayMonth.format("YYYY年M月")}
                        onPreviousMonth={goToPreviousMonth}
                        onNextMonth={goToNextMonth}
                        />

                        <CalendarGrid
                            calendarDays={calendarDays}
                            dailyExpenseTotals={dailyExpenseTotals}
                            selectedDate={selectedDate}
                            onDayClick={handleCalendarDayClick}
                        />
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