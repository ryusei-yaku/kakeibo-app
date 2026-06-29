import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MonthlyCategorySummaryPage from "./features/categories/MonthlyCategorySummaryPage";
import ExpenseFormPage from "./features/expenses/ExpenseFormPage";
import HomePage from "./features/home/HomePage";
import type { Expense } from "./types/expense";
import MonthlyCategoryDetailPage from "./features/categories/MonthlyCategoryDetailPage";

function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  function addExpense(expense: Expense) {
    setExpenses((currentExpenses) => [expense, ...currentExpenses]);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage expenses={expenses} />} />
        <Route
          path="/expenses/new"
          element={<ExpenseFormPage expenses={expenses} onAddExpense={addExpense} />}
        />
        <Route
          path="/categories/monthly"
          element={<MonthlyCategorySummaryPage expenses={expenses}/>}
        />
        <Route
          path="/categories/monthly/:categoryId"
          element={<MonthlyCategoryDetailPage expenses={expenses}/>}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
