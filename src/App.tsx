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
import {
  deleteExpenseFromFirestore,
  saveCategoryToFirestore,
  saveExpenseToFirestore,
  softDeleteCategoryToFirestore,
  updateCategoryToFirestore,
  updateExpenseCategoryNameToFirestore,
  updateExpenseToFirestore,
} from "./lib/firestoreStorage";

function App() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpensesFromStorage);
  const [categories, setCategories] = useState<Category[]>(loadCategoriesFromStorage);

  async function addCategory(categoryName: string) {
    // 同じ名前の削除済みカテゴリーがあるか確認する
    // ある場合は、新規追加ではなく復活させる
    const deletedCategory = categories.find(
      (category) =>
        category.name === categoryName &&
        category.isDeleted
    );

    if (deletedCategory) {
      // 復活させるカテゴリーを作る
      // Firestoreにも同じ内容を保存するため、変数として取り出しておく
      const restoredCategory: Category = {
        ...deletedCategory,
        isDeleted: false,
      };

      // 先に画面上のカテゴリー一覧を更新する
      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === restoredCategory.id
            ? restoredCategory
            : category
        )
      );

      try {
        // Firestore上のカテゴリーも復活させる
        await saveCategoryToFirestore(restoredCategory);
      } catch (error) {
        // Firestore保存に失敗しても、今はlocalStorage側には反映される
        // まずは開発中に原因を確認できるよう、コンソールに出す
        console.error("Firestoreへのカテゴリー復活保存に失敗しました", error);
      }

      return;
    }

    // 新しく追加するカテゴリーを作る
    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: categoryName,
      isDeleted: false,
    };

    // 先に画面上のカテゴリー一覧を更新する
    setCategories((currentCategories) => [
      ...currentCategories,
      newCategory,
    ]);

    try {
      // localStorageとは別に、Firestoreにもカテゴリーデータを保存する
      await saveCategoryToFirestore(newCategory);
    } catch (error) {
      // Firestore保存に失敗しても、今はlocalStorage側にはデータが残る
      // まずは開発中に原因を確認できるよう、コンソールに出す
      console.error("Firestoreへのカテゴリー保存に失敗しました", error);
    }
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

  async function updateExpense(updatedExpense: Expense) {
    // 先に画面上の支出データを更新する
    // これにより、Firestore保存を待たずに編集結果をすぐ反映できる
    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );

    try {
      // localStorageとは別に、Firestore上の支出データも更新する
      await updateExpenseToFirestore(updatedExpense);
    } catch (error) {
      // Firestore更新に失敗しても、今はlocalStorage側には編集内容が残る
      // まずは開発中に原因を確認できるよう、コンソールに出す
      console.error("Firestoreへの支出更新に失敗しました", error);
    }
  }

  async function deleteExpense(expenseId: string) {
    // 先に画面上の支出データを削除する
    // これにより、Firestore削除を待たずに画面へすぐ反映できる
    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== expenseId)
    );

    try {
      // localStorageとは別に、Firestore上の支出データも削除する
      await deleteExpenseFromFirestore(expenseId);
    } catch (error) {
      // Firestore削除に失敗しても、今はlocalStorage側では削除済みになる
      // まずは開発中に原因を確認できるよう、コンソールに出す
      console.error("Firestoreからの支出削除に失敗しました", error);
    }
  }

  async function updateCategory(categoryId: string, categoryName: string) {
    // Firestoreにも保存するため、更新後のカテゴリーを先に作る
    const updatedCategory = categories.find(
      (category) => category.id === categoryId
    );

    // 対象カテゴリーが見つからない場合は、何もしない
    if (!updatedCategory) {
      return;
    }

    const renamedCategory: Category = {
      ...updatedCategory,
      name: categoryName,
    };

    // 先に画面上のカテゴリー名を更新する
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === categoryId
          ? renamedCategory
          : category
      )
    );

    // 過去に登録した支出データの categoryName も更新する
    // categoryId は変えず、表示用のカテゴリー名だけを変える
    setExpenses((currentExpenses) =>
      currentExpenses.map((expense) =>
        expense.categoryId === categoryId
          ? { ...expense, categoryName }
          : expense
      )
    );

    try {
      // Firestore上のカテゴリー名も更新する
      await updateCategoryToFirestore(renamedCategory);

      // Firestore上の過去支出データのcategoryNameも更新する
      // categoryIdは変えず、表示用のカテゴリー名だけを新しい名前にそろえる
      await updateExpenseCategoryNameToFirestore(categoryId, categoryName);
    } catch (error) {
      // Firestore更新に失敗しても、今はlocalStorage側には編集内容が残る
      // まずは開発中に原因を確認できるよう、コンソールに出す
      console.error("Firestoreへのカテゴリー更新に失敗しました", error);
    }
  }

  async function deleteCategory(categoryId: string) {
    // Firestoreにも保存するため、削除対象のカテゴリーを取得する
    const deleteTargetCategory = categories.find(
      (category) => category.id === categoryId
    );

    // 対象カテゴリーが見つからない場合は、何もしない
    if (!deleteTargetCategory) {
      return;
    }

    // 削除済みにしたカテゴリーを作る
    // 今のアプリでは完全削除ではなく、isDeleted: true にする
    const deletedCategory: Category = {
      ...deleteTargetCategory,
      isDeleted: true,
    };

    // 先に画面上のカテゴリーを削除済みにする
    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === categoryId
          ? deletedCategory
          : category
      )
    );

    try {
      // Firestore上のカテゴリーも削除済みにする
      await softDeleteCategoryToFirestore(deletedCategory);
    } catch (error) {
      // Firestore更新に失敗しても、今はlocalStorage側では削除済みになる
      // まずは開発中に原因を確認できるよう、コンソールに出す
      console.error("Firestoreへのカテゴリー削除反映に失敗しました", error);
    }
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
