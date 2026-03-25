import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import { Eye, Lock, Mail, User } from "lucide-react";
import { FaApple, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const Signup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        try {
            await signup(name, email, password);
        } catch (error) {
        }
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen w-full bg-[linear-gradient(180deg,#f8d9df_0%,#fff5f6_52%,#fbe7ec_100%)] px-3 py-4 sm:px-6 sm:py-8 lg:px-10">
            <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-2xl items-center justify-center sm:min-h-[calc(100vh-4rem)]">
                <div className="w-full overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(163,82,104,0.16)] sm:rounded-[36px]">
                    <div className="flex items-center justify-center px-4 py-8 sm:px-10 sm:py-10 lg:px-16">
                        <div className="w-full max-w-md">
                            <div className="mb-8 text-center sm:mb-10">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Sign Up</h1>
                                <p className="mt-3 text-sm text-slate-500">
                                    Create your workspace and start managing tasks beautifully.
                                </p>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Name</label>
                                    <label className="flex h-14 items-center rounded-2xl border border-slate-300 bg-white px-4 shadow-sm transition focus-within:border-[#ff7a8c]">
                                        <User size={18} className="mr-3 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Enter your name"
                                            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                        />
                                    </label>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                                    <label className="flex h-14 items-center rounded-2xl border border-[#efc77f] bg-white px-4 shadow-sm transition focus-within:border-[#ff7a8c]">
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
                                    <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                                    <label className="flex h-14 items-center rounded-2xl border border-slate-300 bg-white px-4 shadow-sm transition focus-within:border-[#ff7a8c]">
                                        <Eye size={18} className="mr-3 text-slate-500" />
                                        <input
                                            type="password"
                                            placeholder="Create your password"
                                            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <Lock size={18} className="ml-3 text-slate-400" />
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="h-13 w-full rounded-2xl bg-[#ff7b86] text-base font-semibold text-white shadow-[0_14px_30px_rgba(255,123,134,0.35)] transition hover:bg-[#ff6a77] sm:h-14 sm:text-lg"
                                >
                                    Create Account
                                </button>

                                <div className="flex items-center gap-4 pt-3">
                                    <div className="h-px flex-1 bg-slate-300" />
                                    <span className="text-sm text-slate-500">Or Continue With</span>
                                    <div className="h-px flex-1 bg-slate-300" />
                                </div>

                                <div className="flex justify-center gap-3 sm:gap-4">
                                    <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:h-14 sm:w-14">
                                        <FcGoogle size={24} />
                                    </button>
                                    <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-xl font-bold text-[#1877f2] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:h-14 sm:w-14">
                                        <FaFacebookF size={22} />
                                    </button>
                                    <button type="button" className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold uppercase tracking-wide shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:h-14 sm:w-14">
                                        <FaApple size={24} />
                                    </button>
                                </div>

                                <p className="pt-3 text-center text-sm text-slate-600">
                                    Already have an account?{" "}
                                    <Link to="/login" className="font-semibold text-slate-800 underline decoration-[#ff7b86] underline-offset-4">
                                        Login here
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

export default Signup;
