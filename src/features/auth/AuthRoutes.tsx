import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthPage from "./AuthPage";
import ResetPasswordPage from "./ResetPasswordPage";
import SignUpPage from "./SignUpPage";
import VerifyEmailPage from "./VerifyEmailPage";

function AuthRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="*" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AuthRoutes;
