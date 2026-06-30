import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CalendarPage from "./features/calendar/CalendarPage";
import CategoryManagementPage from "./features/categories/CategoryManagementPage";
import MonthlyCategoryDetailPage from "./features/categories/MonthlyCategoryDetailPage";
import MonthlyCategorySummaryPage from "./features/categories/MonthlyCategorySummaryPage";
import ExpenseEditPage from "./features/expenses/ExpenseEditPage";
import ExpenseFormPage from "./features/expenses/ExpenseFormPage";
import HomePage from "./features/home/HomePage";
import {
  loadCategoriesFromStorage,
  loadExpensesFromStorage,
  saveCategoriesToStorage,
  saveExpensesToStorage,
} from "./lib/localStorage";
import type { Category } from "./types/category";
import type { Expense } from "./types/expense";
import { saveExpenseToFirestore } from "./lib/firestoreStorage";

function App() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpensesFromStorage);
  const [categories, setCategories] = useState<Category[]>(loadCategoriesFromStorage);

  function addCategory(categoryName: string) {
    const deletedCategory = categories.find(
      (category) =>
        category.name === categoryName &&
        category.isDeleted
    );

    if (deletedCategory) {
      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === deletedCategory.id
            ? { ...category, isDeleted: false }
            : category
        )
      );

      return;
    }

    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: categoryName,
      isDeleted: false,
    };

    setCategories((currentCategories) => [
      ...currentCategories,
      newCategory,
    ]);
  }

  async function addExpense(expense: Expense) {
    //先に画面上の支出一覧を更新する
    //これにより、Firestore保存を待たずに画面へすぐ反映できる
    setExpenses((currentExpenses) => [expense, ...currentExpenses]);

    try {
      // localStorageとは別に、Firestoreにも支出データを保存する
      // まだ完全移行ではなく、Firestore保存の動作確認用
      await saveExpenseToFirestore(expense);
    } catch (error) {
      // Firestore保存に失敗しても、今はlocalStorage側にはデータが残る
      // まずは開発中に原因を確認できるよう、コンソールに出す
      console.error("Firestoreへの支出保存に失敗しました", error);
    }
  }

  function updateExpense(updateExpense: Expense) {
    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.id === updateExpense.id ? updateExpense : expense
      )
    );
  }

  function deleteExpense(expenseId: string) {
    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== expenseId)
    );
  }

  function updateCategory(categoryId: string, categoryName: string) {
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === categoryId
          ? { ...category, name: categoryName }
          : category
      )
    );

    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.categoryId === categoryId
          ? { ...expense, categoryName }
          : expense
      )
    );
  }

  function deleteCategory(categoryId: string) {
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === categoryId
          ? { ...category, isDeleted: true }
          : category
      )
    );
  }

  // 支出データが変更されるたびに保存する
  // 今はlocalStorageに保存しているが、将来的にFirestore保存へ差し替えやすくする
  useEffect(() => {
    saveExpensesToStorage(expenses);
  }, [expenses]);

  // カテゴリーデータが変更されるたびに保存する
  // 今はlocalStorageに保存しているが、将来的にFirestore保存へ差し替えやすくする
  useEffect(() => {
    saveCategoriesToStorage(categories);
  }, [categories]);

  const activeCategories = categories.filter(
    (category) => !category.isDeleted
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage expenses={expenses} />} />
        {/* 支出入力画面 */}
        <Route
          path="/expenses/new"
          element={
            <ExpenseFormPage
              expenses={expenses}
              categories={activeCategories}
              onAddExpense={addExpense}
            />
          }
        />
        <Route
          path="/categories/monthly"
          element={<MonthlyCategorySummaryPage expenses={expenses} />}
        />
        <Route
          path="/categories/monthly/:categoryId"
          element={<MonthlyCategoryDetailPage expenses={expenses} />}
        />
        <Route path="/calendar" element={<CalendarPage expenses={expenses} />} />
        {/* 支出編集画面 */}
        <Route
          path="/expenses/edit/:expenseId"
          element={
            <ExpenseEditPage
              expenses={expenses}
              categories={categories}
              onUpdateExpense={updateExpense}
              onDeleteExpense={deleteExpense}
            />
          }
        />
        {/* カテゴリー管理画面 */}
        <Route
          path="/categories/manage"
          element={
            <CategoryManagementPage
              categories={categories}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
