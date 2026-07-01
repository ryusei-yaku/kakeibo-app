export type Expense = {
    id: string;
    type: "expense" | "income";
    amount: number;
    categoryId: string;
    categoryName: string;
    date: string;
    memo: string;
};