import { isHoliday } from "@holiday-jp/holiday_jp";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
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
import { useState } from "react";
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

function CalendarPage({ expenses }: CalendarPageProps) {
    // ページ移動をするための関数を用意する
    const navigate = useNavigate();

    //表示中の月を管理する
    //初期値は今日が含まれる月にする
    const [displayMonth, setDisplayMonth] = useState(dayjs().startOf("month"));

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
        <Box sx={{ minHeight: "100vh", backgroundColor: "#f6f4ef", py: 3 }}>
            {/* スマホで見やすい横幅に制限する */}
            <Container maxWidth="sm">
                {/* 画面内の要素を縦方向に間隔を空けて並べる */}
                <Stack spacing={2}>
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {/* カレンダー画面であることを分かりやすくするアイコン */}
                        <CalendarMonthIcon color="primary" />

                        {/* ページタイトル */}
                        <Typography variant="h5" component="h1" sx={{ fontWeight: "bold" }}>
                            カレンダー
                        </Typography>
                    </Box>

                    {/* このページで何ができるかを説明する文 */}
                    <Typography color="text.secondary">
                        今月の支出を日付ごとに確認します。
                    </Typography>

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
                                py: 1,
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
                                gridTemplateColumns: "repeat(7, 1fr)",

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

                                //このマスの日付が今日かどうかを判定する
                                const isToday = calendarDay.date === dayjs().format("YYYY-MM-DD");

                                return (
                                    <Box
                                        key={calendarDay.date}
                                        sx={{
                                            minHeight: 88,

                                            //今日のマスは薄いオレンジにする
                                            //今月以外の日付は薄いグレー、それ以外は白にする
                                            backgroundColor: isToday
                                                ? "#fde7cd"
                                                : calendarDay.isCurrentMonth
                                                    ? "#ffffff"
                                                    : "#f3f3f3",
                                            p: 1,
                                            textAlign: "left",

                                            //右端の列以外に右線を引く
                                            borderRight: index % 7 === 6 ? "none" : "1px solid #d9d9d9",

                                            //各行の下に線を引く
                                            borderBottom: "1px solid #d9d9d9",
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
                                                    mt: 1,
                                                    fontSize: 12,
                                                    fontWeight: "bold",
                                                    color: calendarDay.isCurrentMonth ? "#dc2626" : "#fca5a5",
                                                    textAlign: "right",
                                                }}>
                                                {dailyTotal.toLocaleString()}円
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}

export default CalendarPage;