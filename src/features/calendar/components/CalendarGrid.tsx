import { Box, Typography } from "@mui/material";
import {
    getDayColor,
    getOutsideMonthDayColor,
} from "../utils/calendarColors";
import type { CalendarDay } from "../utils/calendarDays";

// CalendarGrid が受け取るデータの型
type CalendarGridProps = {
    calendarDays: CalendarDay[];
    dailyExpenseTotals: Record<string, number>;
    selectedDate: string;
    onDayClick: (calendarDay: CalendarDay) => void;
};

function CalendarGrid({
    calendarDays,
    dailyExpenseTotals,
    selectedDate,
    onDayClick,
}: CalendarGridProps) {
    // カレンダー上部に表示する曜日
    const weekdays = ["月", "火", "水", "木", "金", "土", "日"];

    return (
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
                }}
            >
                {weekdays.map((weekday) => {
                    // 曜日の見出しの文字色を決める
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
                                    weekday === "日"
                                        ? "none"
                                        : "1px solid rgba(255,255,255,0.35)",
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
                    // 日付の文字色を決める
                    // 今月以外の日付は薄い色にする
                    const dayColor = calendarDay.isCurrentMonth
                        ? getDayColor(calendarDay.date)
                        : getOutsideMonthDayColor(calendarDay.date);

                    // この日付に登録された支出合計を取得する
                    // 合計がない日付の場合は undefined になる
                    const dailyTotal = dailyExpenseTotals[calendarDay.date];

                    // このマスの日付が選択中の日付かどうかを判定する
                    const isSelectedDate = calendarDay.date === selectedDate;

                    return (
                        <Box
                            key={calendarDay.date}
                            onClick={() => onDayClick(calendarDay)}
                            sx={{
                                // 縦幅固定
                                height: 58,

                                // 中身が長くてもマスの横幅を広げない
                                minWidth: 0,

                                // 選択中のマスは薄いオレンジにする
                                // 今月以外の日付は薄いグレー、それ以外は白にする
                                backgroundColor: isSelectedDate
                                    ? "#fde7cd"
                                    : calendarDay.isCurrentMonth
                                        ? "#ffffff"
                                        : "#f3f3f3",

                                p: 0.75,
                                textAlign: "left",

                                // 右端の列以外に右線を引く
                                borderRight:
                                    index % 7 === 6 ? "none" : "1px solid #d9d9d9",

                                // 各行の下に線を引く
                                borderBottom: "1px solid #d9d9d9",

                                cursor: "pointer",

                                // マスからはみ出した内容は表示しない
                                overflow: "hidden",

                                // padding込みでheightに収める
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
                                        color: calendarDay.isCurrentMonth
                                            ? "#dc2626"
                                            : "#fca5a5",
                                        textAlign: "right",

                                        // 親の幅を超えない
                                        maxWidth: "100%",
                                        minWidth: 0,

                                        // 金額が長い場合は折り返さず、省略する
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
    );
}

export default CalendarGrid;