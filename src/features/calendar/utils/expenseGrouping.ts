import dayjs from "../../../lib/dayjs";
import type { Expense } from "../../../types/expense";

// 日付ごとにまとめた支出・収入一覧の型
export type DailyExpenseGroup = {
    date: string;
    incomeAmount: number;
    expenseAmount: number;
    balanceAmount: number;
    items: Expense[];
};

// 日付ごとの収入合計・支出合計を作る
// 例: { "2026-06-01": { incomeAmount: 5000, expenseAmount: 1200 } }
export function createDailyExpenseTotals(expenses: Expense[]) {
    return expenses.reduce<Record<string, { incomeAmount: number; expenseAmount: number }>>(
        (totals, expense) => {
            // すでにその日付の集計があれば使い、なければ0で初期化する
            const currentTotal = totals[expense.date] ?? {
                incomeAmount: 0,
                expenseAmount: 0,
            };

            return {
                ...totals,
                [expense.date]: {
                    // 収入なら収入合計に加算する
                    incomeAmount:
                        currentTotal.incomeAmount +
                        (expense.type === "income" ? expense.amount : 0),

                    // 支出なら支出合計に加算する
                    expenseAmount:
                        currentTotal.expenseAmount +
                        (expense.type === "expense" ? expense.amount : 0),
                },
            };
        },
        {}
    );
}

// 指定した月に登録された支出だけを取り出す
export function filterExpensesByMonth(expenses: Expense[], month: string) {
    return expenses.filter((expense) => expense.date.startsWith(month));
}

// 支出を日付の新しい順に並べる
export function sortExpensesByDateDesc(expenses: Expense[]) {
    return [...expenses].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
    );
}

// 支出・収入を日付ごとにまとめる
// 支出・収入を日付ごとにまとめる
export function groupExpensesByDate(expenses: Expense[]) {
    return expenses.reduce<DailyExpenseGroup[]>((groups, expense) => {
        // すでに同じ日付のグループがあるか探す
        const existingGroup = groups.find((group) => group.date === expense.date);

        // 収入なら収入合計に加算し、支出なら支出合計に加算する
        const incomeAmount = expense.type === "income" ? expense.amount : 0;
        const expenseAmount = expense.type === "expense" ? expense.amount : 0;

        if (existingGroup) {
            existingGroup.items.push(expense);
            existingGroup.incomeAmount += incomeAmount;
            existingGroup.expenseAmount += expenseAmount;
            existingGroup.balanceAmount =
                existingGroup.incomeAmount - existingGroup.expenseAmount;

            return groups;
        }

        return [
            ...groups,
            {
                date: expense.date,
                incomeAmount,
                expenseAmount,
                balanceAmount: incomeAmount - expenseAmount,
                items: [expense],
            },
        ];
    }, []);
}