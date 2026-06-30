import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MonthlyCategorySummaryPage from "./features/categories/MonthlyCategorySummaryPage";
import ExpenseFormPage from "./features/expenses/ExpenseFormPage";
import HomePage from "./features/home/HomePage";
import type { Expense } from "./types/expense";
import MonthlyCategoryDetailPage from "./features/categories/MonthlyCategoryDetailPage";
import CalendarPage from "./features/calendar/CalendarPage";
import ExpenseEditPage from "./features/expenses/ExpenseEditPage";
import type { Category } from "./types/category";
import { initialCategories } from "./features/categories/categories";
import CategoryManagementPage from "./features/categories/CategoryManagementPage"

const EXPENSES_STORAGE_KEY = "kakeibo-expenses";
const CATEGORIES_STORAGE_KEY = "kakeibo-categories";

function loadExpensesFromStorage() {
  try {
    const savedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);

    if (savedExpenses === null) {
      return [];
    }

    return JSON.parse(savedExpenses) as Expense[];
  } catch {
    return [];
  }
}

function loadCategoriesFromStorage() {
  try {
    const savedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);

    if (savedCategories === null) {
      return initialCategories;
    }

    return JSON.parse(savedCategories) as Category[];
  } catch {
    return initialCategories;
  }
}

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

  function addExpense(expense: Expense) {
    setExpenses((currentExpenses) => [expense, ...currentExpenses]);
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

  useEffect(() => {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
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
