import { useParams } from "react-router-dom";

function ExpenseEditPage() {
    //URLの:expenseIdに入っている支出IDを取得する
    const { expenseId } = useParams();

    return (
        <div>
            支出編集画面：{expenseId}
        </div>
    );
}

export default ExpenseEditPage;