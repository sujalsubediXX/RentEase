// pages/ForgotPasswordPage.tsx
import { useState} from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../services/auth.services.ts";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      await requestPasswordReset(email);
      setStatus("sent");
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.response?.data?.message || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-stone-800 mb-2">Forgot password?</h1>
        <p className="text-sm text-stone-500 mb-6">
          Enter the email linked to your account and we'll send you a reset link.
        </p>

        {status === "sent" ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg p-4">
            If an account exists for <span className="font-medium">{email}</span>, a reset
            link has been sent. Check your inbox (and spam folder).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-60
                         text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {status === "loading" ? "Sending..." : "Send reset link"}
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

export default ForgotPasswordPage;