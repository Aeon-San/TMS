import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import API from "../library/api.js";

const getApiErrorMessage = (error, fallback) => {
  const details = error.response?.data?.details;
  if (Array.isArray(details) && details.length > 0) {
    return details[0]?.message || fallback;
  }

  return error.response?.data?.message || fallback;
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/forgot-password", { email });
      setResetUrl(data.resetUrl || "");
      toast.success(data.message || "Reset link created.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to generate reset link."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,184,178,0.35),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#f4f1ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#ff7a86] via-[#ffd08a] to-[#ff8f7a]" />
          <div className="absolute -left-20 top-10 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="absolute -right-20 bottom-10 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />

          <div className="relative px-6 py-10 sm:px-10 lg:px-14">
            <div className="mx-auto w-full max-w-md text-center">
              <div className="mb-4 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                Reset access
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-950">
                Forgot Password
              </h1>
              <p className="mt-3 text-sm text-slate-500">
                Enter your email and we&apos;ll generate a reset link for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mx-auto mt-8 w-full max-w-md space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <label className="flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-100">
                  <Mail size={18} className="mr-3 text-slate-500" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#ff7a86] to-[#ff8f7a] text-lg font-semibold text-white shadow-[0_18px_36px_rgba(255,122,134,0.32)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Generating..." : "Generate Reset Link"}
              </button>

              {resetUrl ? (
                <div className="rounded-3xl border border-[#ffd2d7] bg-[#fff7f8] p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Reset link ready</p>
                  <a className="mt-2 block break-all text-[#c4456f] underline" href={resetUrl}>
                    {resetUrl}
                  </a>
                </div>
              ) : null}

              <p className="pt-3 text-center text-sm text-slate-600">
                Back to{" "}
                <Link to="/login" className="font-semibold text-slate-900 underline decoration-rose-400 underline-offset-4">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
