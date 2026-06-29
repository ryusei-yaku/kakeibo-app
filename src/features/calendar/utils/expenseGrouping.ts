import dayjs from "../../../lib/dayjs";
import type { Expense } from "../../../types/expense";

// 日付ごとにまとめた支出一覧の型
export type DailyExpenseGroup = {
    date: string;
    totalAmount: number;
    items: Expense[];
};

// 日付ごとの支出合計を作る
// 例: { "2026-06-01": 1200, "2026-06-02": 800 } の形にする
export function createDailyExpenseTotals(expenses: Expense[]) {
    return expenses.reduce<Record<string, number>>((totals, expense) => {
        const currentTotal = totals[expense.date] ?? 0;

        return {
            ...totals,
            [expense.date]: currentTotal + expense.amount,
        };
    }, {});
}

// 指定した月に登録された支出だけを取り出す
export function filterExpensesByMonth(expenses: Expense[], month: string) {
    return expenses.filter((expense) => expense.date.startsWith(month));
}

// 支出合計を計算する
export function calculateTotalAmount(expenses: Expense[]) {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
}

// 支出を日付の新しい順に並べる
export function sortExpensesByDateDesc(expenses: Expense[]) {
    return [...expenses].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    );
}

// 支出を日付ごとにまとめる
export function groupExpensesByDate(expenses: Expense[]) {
    return expenses.reduce<DailyExpenseGroup[]>((groups, expense) => {
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
}