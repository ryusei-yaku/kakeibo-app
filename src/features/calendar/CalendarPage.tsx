import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
    Box,
    Button,
    Container,
    Stack,
    Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Expense } from "../../types/expense";
import dayjs from "../../lib/dayjs";

// CalendarPageがApp.tsxから受け取るデータの型
type CalendarPageProps = {
    expenses: Expense[];
};

//カレンダーに表示する1日分の情報
//月初めの前に入れる空白マスも扱うため、dateとdayはnullも許可する
type CalendarDay = {
    date: string | null;
    day: number | null;
    isCurrentMonth: boolean;
}

//曜日に応じて文字色を返す
//土曜日は青色、日曜日は赤色、それ以外は通常色にする
function getDayColor(dayOfWeek: number) {
    if (dayOfWeek === 6) {
        return "#2563eb";
    }

    if (dayOfWeek === 0) {
        return "#dc2626";
    }

    return "text.primary";
}

function CalendarPage({ expenses }: CalendarPageProps) {
    // ページ移動をするための関数を用意する
    const navigate = useNavigate();
    //今日が含まれる年月日を"2026-06"のような形式で取得する
    const currentMonth = dayjs().format("YYYY-MM");

    //全支出の中から、今月の日付の支出だけを取り出す
    const monthlyExpenses = expenses.filter((expense) =>
        expense.date.startsWith(currentMonth)
    );

    //今月の最初の日を取得する
    const startOfMonth = dayjs().startOf("month");

    //今月の最終日を取得する
    const endOfMonth = dayjs().endOf("month");

    //今月が何日まであるかを取得する
    const daysInMonth = endOfMonth.date();

    //月初めが何曜日かを取得する
    // dayjsのday()は日=0, 月=1, ..., 土=6
    const firstDayOfWeek = startOfMonth.day();

    //月曜始まり用に、月初めの前に何個の空白マスが必要かを計算する
    //月曜なら0個、日曜なら6個
    const blankDaysBeforeMonth = (firstDayOfWeek + 6) % 7;

    //月初めの前に表示する空白マスを作る
    const blankCalendarDays: CalendarDay[] = Array.from(
        { length: blankDaysBeforeMonth },
        () => ({
            date: null,
            day: null,
            isCurrentMonth: false
        })
    );

    //今月の日付マスを作る
    const currentMonthCalendarDays: CalendarDay[] = Array.from(
        { length: daysInMonth },
        (_, index) => {
            const day = index + 1;

            //比較や表示に使う日付文字列を作る
            const date = startOfMonth.date(day).format("YYYY-MM-DD");

            return {
                date,
                day,
                isCurrentMonth: true,
            };
        }
    );

    //空白マスと今月の日付マスを結合して、カレンダーに表示する配列を作る
    const calendarDays: CalendarDay[] = [
        ...blankCalendarDays,
        ...currentMonthCalendarDays,
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

                    {/* カレンダー全体の箱 */}
                    <Box
                        sx={{
                            backgroundColor: "#ffffff",
                            borderRadius: 3,
                            p: 2,
                        }}
                    >
                        {/* 曜日の見出し */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(7, 1fr)",
                            }}>
                            {weekdays.map((weekday) => {
                                //曜日の見出しの文字色を決める
                                const color =
                                    weekday === "土"
                                        ? "#2563eb"
                                        : weekday === "日"
                                            ? "#dc2626"
                                            : "text.secondary";

                                return (
                                    <Typography
                                        key={weekday}
                                        sx={{
                                            textAlign: "center",
                                            fontWeight: "bold",
                                            fontSize: 14,
                                            color,
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
                                gap: 1,
                            }}
                        >
                            {calendarDays.map((calendarDay, index) => {
                                //空白マスの場合は、日付の計算をしない
                                const dayColor =
                                    calendarDay.date === null
                                        ? "transparent"
                                        : getDayColor(dayjs(calendarDay.date).day());

                                return (
                                    <Box
                                        key={calendarDay.date ?? `blank-${index}`}
                                        sx={{
                                            minHeight: 56,
                                            borderRadius: 2,
                                            backgroundColor: calendarDay.date === null ? "transparent" : "#f6f4ef",
                                            p: 1,
                                            textAlign: "center",
                                        }}
                                    >
                                        {/* 空白マスではない場合だけ日付を表示する */}
                                        {calendarDay.day !== null && (
                                            <Typography sx={{ fontWeight: "bold", color: dayColor }}>
                                                {calendarDay.day}
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