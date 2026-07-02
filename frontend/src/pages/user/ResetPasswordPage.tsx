// pages/ResetPasswordPage.tsx
import { useState } from "react";
import type {FormEvent} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPasswordWithToken } from "../../services/auth.services.ts";

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 6) {
      setStatus("error");
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setStatus("error");
      setErrorMsg("Passwords do not match.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      await resetPasswordWithToken(token, password);
      setStatus("success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.response?.data?.message || "Reset link is invalid or expired.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-stone-800 mb-2">Reset your password</h1>
        <p className="text-sm text-stone-500 mb-6">Enter a new password for your account.</p>

        {status === "success" ? (
          <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-4">
            Password reset successful. Redirecting you to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
                New password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700 mb-1">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {status === "error" && <p className="text-sm text-red-600">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-60
                         text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {status === "loading" ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-amber-700 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;