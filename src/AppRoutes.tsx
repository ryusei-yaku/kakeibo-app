import type { User } from "firebase/auth";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
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

// 各画面は、その画面が必要になったタイミングで読み込む
const CalendarPage = lazy(
    () => import("./features/calendar/CalendarPage")
);

const CategoryManagementPage = lazy(
    () => import("./features/categories/CategoryManagementPage")
);

const MonthlyCategoryDetailPage = lazy(
    () => import("./features/categories/MonthlyCategoryDetailPage")
);

const MonthlyCategorySummaryPage = lazy(
    () => import("./features/categories/MonthlyCategorySummaryPage")
);


const ExpenseEditPage = lazy(
    () => import("./features/expenses/ExpenseEditPage")
);

const ExpenseFormPage = lazy(
    () => import("./features/expenses/ExpenseFormPage")
);

const HomePage = lazy(
    () => import("./features/home/HomePage")
);

const ProfilePage = lazy(
    () => import("./features/profile/ProfilePage")
);

const MonthlyReportPage = lazy(
    () => import("./features/reports/MonthlyReportPage")
);

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
            <Suspense fallback={<LoadingScreen />}>
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
            </Suspense>
        </BrowserRouter>
    );
}

export default AppRoutes;