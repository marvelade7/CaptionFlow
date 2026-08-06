import { useState } from "react";
import { AudioLines, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import api from "../services/api.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 48 48">
            <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
            />
            <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 15.8 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"
            />
            <path
                fill="#4CAF50"
                d="M24 44c5.4 0 10.4-1.9 14.2-5.2l-6.6-5.6C29.6 34.7 27 35.5 24 35.5c-5.3 0-9.8-3.4-11.4-8.1l-6.6 5.1C9.9 39.7 16.4 44 24 44z"
            />
            <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2.1 3.9-3.8 5.2l6.6 5.6C41.4 36.3 44 30.7 44 24c0-1.2-.1-2.4-.4-3.5z"
            />
        </svg>
    );
}

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errMessage, setErrMessage] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const loginHandler = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get("email");
        const password = formData.get("password");

        setSubmitting(true);
        setErrMessage("");
        api.post("/auth/login", { email, password })
            .then((res) => {
                login(res.data.user, res.data.token);
                toast.success("Login successful!");
                navigate("/dashboard");
            })
            .catch((err) => {
                setSubmitting(false);
                toast.error(
                    err.response?.data?.message ||
                        "Login failed. Please try again.",
                );
                setErrMessage(
                    err.response?.data?.message ||
                        "Login failed. Please try again.",
                );
            });
    };

    return (
        <div className="w-full  bg-[#FAF8FF] h-full overflow-hidden grid grid-cols-1 lg:grid-cols-2">
            {/* Left panel — form */}
            <div className="p-5 sm:p-7 bg-white shadow-sm rounded-xl flex flex-col justify-center mx-auto md:w-120 w-[90%] my-10 lg:mx-35 lg:my-13">
                <img
                    src="./captionFlowLogo33.png"
                    width="60"
                    className="mb-5"
                />

                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Welcome back
                </h1>
                <p className="text-sm text-gray-500 mb-8">
                    Kinetic clarity in every transcription.
                </p>

                <form className="space-y-5" onSubmit={loginHandler}>
                    {/* Error message */}
                    {errMessage &&
                        setTimeout(() => {
                            setErrMessage("");
                        }, 3000) && (
                            <p className="text-red-500 text-sm mb-5 bg-red-50 p-2 rounded-lg text-center border border-red-200 font-medium">
                                {errMessage}
                            </p>
                        )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:border-none focus:ring-2 focus:ring-[#7C3AED]/70 focus:border-[#7C3AED]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="••••••••"
                                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:border-none focus:ring-2 focus:ring-[#7C3AED]/70 focus:border-[#7C3AED]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={16} />
                                ) : (
                                    <Eye size={16} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]/40"
                            />
                            Remember me
                        </label>
                        <a
                            href="#"
                            className="text-[#7C3AED] font-medium hover:underline"
                        >
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full bg-[#7C3AED] flex items-center cursor-pointer justify-center gap-3 text-white font-semibold text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {submitting && (
                            <AudioLines
                                size={16}
                                className="animate-spin text-white cursor-not-allowed"
                            />
                        )}
                        {submitting ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="flex items-center gap-3 my-6">
                    <div className="h-px flex-1 bg-gray-200" />
                    <span className="text-[11px] tracking-wide text-gray-400 font-medium">
                        OR CONTINUE WITH
                    </span>
                    <div className="h-px flex-1 bg-gray-200" />
                </div>

                <button className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <GoogleIcon />
                    Sign In With Google
                </button>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don&apos;t have an account?{" "}
                    <Link
                        to="/signup"
                        className="text-[#7C3AED] font-medium hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
            </div>

            {/* Right panel — promo */}
            <div className="relative hidden lg:flex flex-col justify-center p-10 sm:p-12 bg-[#7C3AED] overflow-hidden">
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />

                <span className="relative inline-flex w-fit items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold mb-5">
                    v2.0 Performance
                </span>

                <h2 className="relative text-3xl font-bold text-white leading-snug mb-8 max-w-100">
                    Automate your speech-to-text workflow.
                </h2>

                <div className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center mb-8">
                    <div className="relative mb-4">
                        <AudioLines
                            className="text-[#7C3AED]"
                            size={56}
                            strokeWidth={1.75}
                        />
                        <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#7C3AED] flex items-center justify-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </span>
                    </div>
                    <div className="w-full space-y-1.5 mb-3">
                        <div className="h-1.5 rounded-full bg-purple-100 w-full" />
                        <div className="h-1.5 rounded-full bg-purple-100 w-4/5 mx-auto" />
                    </div>
                    <p className="text-[11px] text-gray-400">
                        Processing high-fidelity audio streams...
                    </p>
                </div>

                <p className="relative text-sm text-white/90 italic leading-relaxed mb-4">
                    "CaptionFlow has reduced our transcription turnaround by 80%
                    while maintaining absolute linguistic precision."
                </p>

                <div className="relative flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/30 overflow-hidden flex items-center justify-center text-white text-xs font-semibold">
                        SM
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white">
                            Sarah Mitchell
                        </p>
                        <p className="text-[11px] text-white/70">
                            CTO at Kinetic Media
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
