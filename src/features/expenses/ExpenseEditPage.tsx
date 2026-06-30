import { useParams } from "react-router-dom";
import type { Expense } from "../../types/expense";

type ExpenseEditPageProps = {
    expenses: Expense[];
}

function ExpenseEditPage({ expenses }: ExpenseEditPageProps) {
    //URLの:expenseIdに入っている支出IDを取得する
    const { expenseId } = useParams();

    //URLの支出IDと一致する支出データを探す
    const expense = expenses.find((expense) => expense.id === expenseId);

    if (expense === undefined) {
        return (
            <div>
                支出が見つかりませんでした。
            </div>
        );
    }

    return (
        <div>
            <p>支出編集画面：{expense.id}</p>
            <p>日付：{expense.date}</p>
            <p>カテゴリー：{expense.categoryName}</p>
            <p>金額：{expense.amount.toLocaleString()}円</p>
            <p>店名：{expense.shopName}</p>
            <p>メモ：{expense.memo}</p>
        </div>
    );
}

export default ExpenseEditPage;