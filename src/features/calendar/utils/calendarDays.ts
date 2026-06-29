import type { Dayjs } from "dayjs"

// カレンダーに表示する1日分の情報
// 前月・今月・翌月の日付を表示するため、isCurrentMonthで今月かどうかを区別する
export type CalendarDay = {
    date: string;
    day: number;
    isCurrentMonth: boolean;
};

// 表示中の月に対応するカレンダー日付マスを作る
export function createCalendarDays(displayMonth: Dayjs) {
    // 表示中の月の最初の日を取得する
    const startOfMonth = displayMonth.startOf("month");

    // 表示中の月の最終日を取得する
    const endOfMonth = displayMonth.endOf("month");

    // 今月が何日まであるかを取得する
    const daysInMonth = endOfMonth.date();

    // 月初めが何曜日かを取得する
    // dayjsのday()は日=0, 月=1, ..., 土=6
    const firstDayOfWeek = startOfMonth.day();

    // 月曜始まり用に、月初めの前に何個の前月マスが必要かを計算する
    // 月曜なら0個、日曜なら6個
    const previousMonthDaysCount = (firstDayOfWeek + 6) % 7;

    // 今月の1日の前に表示する、前月の日付マスを作る
    const previousMonthCalendarDays: CalendarDay[] = Array.from(
        { length: previousMonthDaysCount },
        (_, index) => {
            const date = startOfMonth.subtract(
                previousMonthDaysCount - index,
                "day"
            );

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
            const date = startOfMonth.date(day);

            return {
                date: date.format("YYYY-MM-DD"),
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
            const date = endOfMonth.add(index + 1, "day");

            return {
                date: date.format("YYYY-MM-DD"),
                day: date.date(),
                isCurrentMonth: false,
            };
        }
    );

    // 前月・今月・翌月の日付マスを結合して返す
    return [
        ...previousMonthCalendarDays,
        ...currentMonthCalendarDays,
        ...nextMonthCalendarDays,
    ];
}