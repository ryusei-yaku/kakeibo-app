import type { User } from "firebase/auth";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CalendarPage from "./features/calendar/CalendarPage";
import CategoryManagementPage from "./features/categories/CategoryManagementPage";
import MonthlyCategoryDetailPage from "./features/categories/MonthlyCategoryDetailPage";
import MonthlyCategorySummaryPage from "./features/categories/MonthlyCategorySummaryPage";
import ExpenseEditPage from "./features/expenses/ExpenseEditPage";
import ExpenseFormPage from "./features/expenses/ExpenseFormPage";
import HomePage from "./features/home/HomePage";
import ProfilePage from "./features/profile/ProfilePage";
import MonthlyReportPage from "./features/reports/MonthlyReportPage";
import type { Category } from "./types/category";
import type { Expense } from "./types/expense";
import type { Profile } from "./types/profile";

type ExpenseActions = {
    // 支出・収入データを追加する
    addExpense: (expense: Expense) => Promise<void>;

    // 支出・収入データを更新する
    updateExpense: (expense: Expense) => Promise<void>;

    // 支出・収入データを削除する
    deleteExpense: (expenseId: string) => Promise<void>;
};

type CategoryActions = {
    // カテゴリーを追加する
    addCategory: (
        categoryName: string,
        categoryType: "expense" | "income"
    ) => Promise<void>;

    // カテゴリー名を更新する
    updateCategory: (
        categoryId: string,
        categoryName: string,
    ) => Promise<void>;

    // カテゴリーを削除する
    deleteCategory: (categoryId: string) => Promise<void>;

};

type AppRoutesProps = {
    expenses: Expense[];
    categories: Category[];
    activeCategories: Category[];
    sortedCategories: Category[];
    currentUser: User;
    profile: Profile;

    // 支出・収入に関する操作
    expenseActions: ExpenseActions;

    // カテゴリーに関する操作
    categoryActions: CategoryActions;

    // プロフィール名を保存する
    onSaveDisplayName: (displayName: string) => Promise<void>;

    // ログアウトする
    onLogout: () => void;
};

function AppRoutes({
    expenses,
    categories,
    activeCategories,
    sortedCategories,
    currentUser,
    profile,
    expenseActions,
    categoryActions,
    onSaveDisplayName,
    onLogout,
}: AppRoutesProps) {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<HomePage expenses={expenses} profile={profile} />}
                />

                <Route
                    path="/expenses/new"
                    element={
                        <ExpenseFormPage
                            expenses={expenses}
                            categories={activeCategories}
                            onAddExpense={expenseActions.addExpense}
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
                            onUpdateExpense={expenseActions.updateExpense}
                            onDeleteExpense={expenseActions.deleteExpense}
                        />
                    }
                />

                <Route
                    path="/categories/manage"
                    element={
                        <CategoryManagementPage
                            categories={sortedCategories}
                            onAddCategory={categoryActions.addCategory}
                            onUpdateCategory={categoryActions.updateCategory}
                            onDeleteCategory={categoryActions.deleteCategory}
                        />
                    }
                />
                {/* ログイン済み状態で /signup や /login などに残っていた場合はホームへ戻す */}
                <Route path="*" element={<Navigate to="/" replace />} />

                <Route
                    path="/profile"
                    element={
                        <ProfilePage
                            currentUser={currentUser}
                            displayName={profile.displayName}
                            onSaveDisplayName={onSaveDisplayName}
                            onLogout={onLogout}
                        />
                    }
                />
                <Route
                    path="/reports/monthly"
                    element={<MonthlyReportPage expenses={expenses} />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;