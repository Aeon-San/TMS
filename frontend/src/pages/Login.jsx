import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, Lock, Mail } from "lucide-react";
import { FaApple, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,184,178,0.35),_transparent_35%),linear-gradient(180deg,#f8fafc_0%,#f4f1ff_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
        <div className="relative w-full overflow-hidden rounded-[32px] border border-white/70 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#ff7a86] via-[#ffd08a] to-[#ff8f7a]" />
          <div className="absolute -left-20 top-10 h-40 w-40 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="absolute -right-20 bottom-10 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />

          <div className="relative grid gap-8 px-6 py-10 sm:px-10 lg:px-14">
            <div className="mx-auto w-full max-w-md text-center">
              <div className="mb-4 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                Welcome back
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-950">
                Login
              </h1>
              <p className="mt-3 text-sm text-slate-500">
                Sign in to continue managing your work.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mx-auto w-full max-w-md space-y-5">
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <label className="flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-100">
                  <Eye size={18} className="mr-3 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock size={18} className="ml-3 text-slate-400" />
                </label>
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-rose-500 transition hover:text-rose-600"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="h-14 w-full rounded-2xl bg-gradient-to-r from-[#ff7a86] to-[#ff8f7a] text-base font-semibold text-white shadow-[0_18px_36px_rgba(255,122,134,0.32)] transition hover:brightness-105"
              >
                Log In
              </button>

              <div className="flex items-center gap-4 pt-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-sm text-slate-500">Or Continue With</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="flex justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:h-14 sm:w-14"
                >
                  <FcGoogle size={24} />
                </button>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-[#1877f2] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:h-14 sm:w-14"
                >
                  <FaFacebookF size={22} />
                </button>
                <button
                  type="button"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:h-14 sm:w-14"
                >
                  <FaApple size={24} />
                </button>
              </div>

              <p className="pt-3 text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-slate-900 underline decoration-rose-400 underline-offset-4"
                >
                  Sign Up here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
