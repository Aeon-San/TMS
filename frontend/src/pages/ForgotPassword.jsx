import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import toast from "react-hot-toast";
import API from "../library/api.js";

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
      toast.error(error.response?.data?.message || "Unable to generate reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#f8d9df_0%,#fff5f6_52%,#fbe7ec_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[36px] bg-white shadow-[0_30px_80px_rgba(163,82,104,0.16)] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative hidden min-h-[700px] overflow-hidden bg-[#ffe7e5] lg:block">
            <div className="absolute inset-y-0 left-0 w-24 bg-[#ffd9da]" />
            <div className="absolute inset-y-0 right-0 w-24 bg-[#ffd9da]" />
            <div className="absolute left-10 top-10 text-sm font-semibold tracking-wide text-[#c4456f]">
              Mooftask.
            </div>
            <img
              src="/image/anime-style-character-space.png"
              alt="Reset password illustration"
              className="absolute bottom-0 left-1/2 z-10 max-h-[88%] w-auto -translate-x-1/2 object-contain"
            />
          </div>

          <div className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
            <div className="w-full max-w-md">
              <div className="mb-10 text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#d46c8c] lg:hidden">
                  Mooftask
                </p>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Forgot Password</h1>
                <p className="mt-3 text-sm text-slate-500">
                  Enter your email and we&apos;ll generate a reset link for your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <label className="flex h-14 items-center rounded-2xl border border-[#efc77f] bg-white px-4 shadow-sm transition focus-within:border-[#ff7a8c]">
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
                  className="h-14 w-full rounded-2xl bg-[#ff7b86] text-lg font-semibold text-white shadow-[0_14px_30px_rgba(255,123,134,0.35)] transition hover:bg-[#ff6a77] disabled:cursor-not-allowed disabled:opacity-70"
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
                  <Link to="/login" className="font-semibold text-slate-800 underline decoration-[#ff7b86] underline-offset-4">
                    Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
