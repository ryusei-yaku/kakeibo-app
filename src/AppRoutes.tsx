import { BrowserRouter, Route, Routes } from "react-router-dom";
import CalendarPage from "./features/calendar/CalendarPage";
import CategoryManagementPage from "./features/categories/CategoryManagementPage";
import MonthlyCategoryDetailPage from "./features/categories/MonthlyCategoryDetailPage";
import MonthlyCategorySummaryPage from "./features/categories/MonthlyCategorySummaryPage";
import ExpenseEditPage from "./features/expenses/ExpenseEditPage";
import ExpenseFormPage from "./features/expenses/ExpenseFormPage";
import HomePage from "./features/home/HomePage";
import type { Category } from "./types/category";
import type { Expense } from "./types/expense";

type AppRoutesProps = {
    expenses: Expense[];
    categories: Category[];
    activeCategories: Category[];
    sortedCategories: Category[];
    onLogout: () => void;
    onAddExpense: (expense: Expense) => void;
    onUpdateExpense: (expense: Expense) => void;
    onDeleteExpense: (expenseId: string) => void;
    onAddCategory: (
        categoryName: string,
        categoryType: "expense" | "income"
    ) => void;
    onUpdateCategory: (categoryId: string, categoryName: string) => void;
    onDeleteCategory: (categoryId: string) => void;
};

function AppRoutes({
    expenses,
    categories,
    activeCategories,
    sortedCategories,
    onLogout,
    onAddExpense,
    onUpdateExpense,
    onDeleteExpense,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
}: AppRoutesProps) {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<HomePage expenses={expenses} onLogout={onLogout} />}
                />

                <Route
                    path="/expenses/new"
                    element={
                        <ExpenseFormPage
                            expenses={expenses}
                            categories={activeCategories}
                            onAddExpense={onAddExpense}
                        />
                    }
                />

                <Route
                    path="/categories/monthly"
                    element={<MonthlyCategorySummaryPage expenses={expenses} />}
                />

                <Route
                    path="/categories/monthly/:transactionType/:categoryId"
                    element={<MonthlyCategoryDetailPage expenses={expenses} />}
                />

                <Route path="/calendar" element={<CalendarPage expenses={expenses} />} />

                <Route
                    path="/expenses/edit/:expenseId"
                    element={
                        <ExpenseEditPage
                            expenses={expenses}
                            categories={categories}
                            onUpdateExpense={onUpdateExpense}
                            onDeleteExpense={onDeleteExpense}
                        />
                    }
                />

                <Route
                    path="/categories/manage"
                    element={
                        <CategoryManagementPage
                            categories={sortedCategories}
                            onAddCategory={onAddCategory}
                            onUpdateCategory={onUpdateCategory}
                            onDeleteCategory={onDeleteCategory}
                        />
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;