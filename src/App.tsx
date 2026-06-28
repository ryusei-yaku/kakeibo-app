import { BrowserRouter, Route, Routes } from "react-router-dom";
import ExpenseFormPage from "./features/expenses/ExpenseFormPage";
import HomePage from "./features/home/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/expenses/new" element={<ExpenseFormPage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;