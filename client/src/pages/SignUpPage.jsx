import { useState } from "react";
import { AudioLines, Eye, EyeOff, Check } from "lucide-react";
import { Link } from "react-router-dom";

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

// Simple password strength check based on length + variety of character classes
function getPasswordStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0-4
}

const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["#E5E7EB", "#EF4444", "#F59E0B", "#6366F1", "#10B981"];

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
    });
    const strength = getPasswordStrength(formData.password);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <div className="w-full bg-white overflow-hidden grid grid-cols-1 md:grid-cols-2">
            {/* Left panel — form */}
            <div className="p-5 sm:p-7 border border-gray-200 rounded-xl flex flex-col justify-center md:mx-35 md:my-10">
                <img
                    src="./public/captionFlowLogo33.png"
                    width="60"
                    className="mb-5"
                />

                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    Create your account
                </h1>
                <p className="text-sm text-gray-500 mb-8">
                    Start transcribing with kinetic clarity today.
                </p>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                First name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                placeholder="Jane"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Last name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Cooper"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            placeholder="janecooper"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 focus:border-[#7C3AED]"
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

                        {/* Strength meter */}
                        {/* <div className="flex items-center gap-1.5 mt-2">
                                <div className="flex-1 flex gap-1">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="h-1 flex-1 rounded-full transition-colors"
                                            style={{
                                                backgroundColor:
                                                    i < strength ? STRENGTH_COLORS[strength] : "#E5E7EB",
                                            }}
                                        />
                                    ))}
                                </div>
                                <span
                                    className="text-[11px] font-medium w-14 text-right"
                                    style={{ color: password ? STRENGTH_COLORS[strength] : "#9CA3AF" }}
                                >
                                    {password ? STRENGTH_LABELS[strength] : ""}
                                </span>
                            </div> */}
                    </div>

                    <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#7C3AED] focus:ring-[#7C3AED]/40"
                        />
                        <span>
                            I agree to the{" "}
                            <a
                                href="#"
                                className="text-[#7C3AED] font-medium hover:underline"
                            >
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                                href="#"
                                className="text-[#7C3AED] font-medium hover:underline"
                            >
                                Privacy Policy
                            </a>
                        </span>
                    </label>

                    <button
                        type="submit"
                        className="w-full bg-[#7C3AED] text-white font-semibold text-sm py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Create account
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
                    Google
                </button>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-[#7C3AED] font-medium hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </div>

            {/* Right panel — promo */}
            <div className="relative hidden md:flex flex-col justify-center px-10 overflow-hidden  bg-[#7C3AED]">
                {/* <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" /> */}

                <span className="relative inline-flex w-fit items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold mb-5">
                    Join 12,000+ teams
                </span>

                <h2 className="relative text-3xl font-bold text-white leading-snug max-w-100">
                    Every word, captured with kinetic precision.
                </h2>

                <div className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-3 my-10">
                    {[
                        "Real-time transcription accuracy up to 99%",
                        "Support for 40+ languages",
                        "Export in SRT, VTT, and TXT formats",
                    ].map((item) => (
                        <div key={item} className="flex items-start gap-2.5">
                            <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-[#7C3AED]/10 flex items-center justify-center">
                                <Check
                                    size={11}
                                    className="text-[#7C3AED]"
                                    strokeWidth={3}
                                />
                            </span>
                            <span className="text-xs text-gray-600 leading-snug text-left">
                                {item}
                            </span>
                        </div>
                    ))}
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
