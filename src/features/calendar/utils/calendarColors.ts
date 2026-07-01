import { isHoliday } from "@holiday-jp/holiday_jp";
import dayjs from "../../../lib/dayjs";

// 今月の日付に使う文字色を返す
// 土曜日は青、日曜日・祝日は赤、それ以外は通常色にする
export function getDayColor(date: string) {
    const dayOfWeek = dayjs(date).day();

    // 祝日判定ライブラリに渡すため、"YYYY-MM-DD"をDateに変換する
    const dateObject = dayjs(date).toDate();

    if (isHoliday(dateObject) || dayOfWeek === 0) {
        return "#dc2626";
    }

    if (dayOfWeek === 6) {
        return "#2592eb";
    }

    return "#555555";
}

// 今月以外の日付に使う文字色を返す
// 土曜日は薄い青、日曜日・祝日は薄い赤、それ以外は薄いグレーにする
export function getOutsideMonthDayColor(date: string) {
    const dayOfWeek = dayjs(date).day();

    // 祝日判定ライブラリに渡すため、"YYYY-MM-DD"をDateに変換する
    const dateObject = dayjs(date).toDate();

    if (isHoliday(dateObject) || dayOfWeek === 0) {
        return "#fca5a5";
    }

    if (dayOfWeek === 6) {
        return "#93c5fd";
    }

    return "#999999";
}