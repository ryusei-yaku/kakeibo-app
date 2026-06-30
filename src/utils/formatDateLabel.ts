import type { Dayjs } from "dayjs";
import dayjs from "../lib/dayjs";

// 日付を「2026年6月30日(火)」の形に変換する
// string と Dayjs の両方を受け取れるようにしている
export function formatDateLabel(date: string | Dayjs) {
    return dayjs(date).locale("ja").format("YYYY年M月D日(ddd)");
}