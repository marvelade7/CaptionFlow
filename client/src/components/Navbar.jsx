import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/captionFlowLogo22.png";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="sticky top-0 z-50 lg:px-35 px-5 bg-[#FAF8FF] border-b border-gray-200 shadow-sm">
            <div className="flex justify-between items-center py-4">
                <div>
                    <Link to="/" onClick={closeMenu} className="flex items-center gap-1">
                        <img
                            src={logo}
                            className="mb-1 md:w-[70px] w-[50px]"
                        />
                        <h2 className="font-semibold md:text-2xl text-lg cursor-pointer">
                            Caption<span className="text-[#7C3AED]">Flow</span>
                        </h2>
                    </Link>
                </div>

                {/* Desktop navigation */}
                <div className="hidden md:flex gap-8 items-center">
                    <a
                        href="#features"
                        className="text-gray-900 font-bold text-sm hover:text-[#7C3AED] transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="#workflow"
                        className="text-gray-900 font-bold text-sm hover:text-[#7C3AED] transition-colors"
                    >
                        How It Works
                    </a>
                    <a
                        href="#pricing"
                        className="text-gray-900 font-bold text-sm hover:text-[#7C3AED] transition-colors"
                    >
                        Pricing
                    </a>
                </div>

                {/* Desktop Auth CTA */}
                <div className="hidden md:flex items-center gap-5">
                    <Link to="/login">
                        <button className="border text-[#7C3AED] border-[#7C3AED] py-2 px-5 rounded-lg cursor-pointer font-medium hover:bg-gray-100 transition-colors">
                            Login
                        </button>
                    </Link>
                    <Link to="/signup">
                        <button className="border bg-[#7C3AED] py-2 px-5 rounded-lg text-white font-medium cursor-pointer hover:bg-[#6d28d9] transition-colors">
                            Get Started
                        </button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="md:hidden p-2 rounded-lg bg-[#7C3AED] text-white focus:outline-none"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                    isMenuOpen
                        ? "max-h-96 opacity-100 py-4 border-t border-gray-200"
                        : "max-h-0 opacity-0 py-0 border-t-0"
                } flex flex-col gap-4 bg-[#FAF8FF]`}
            >
                <a
                    href="#features"
                    onClick={closeMenu}
                    className="text-gray-900 font-bold text-base px-2 hover:text-[#7C3AED] transition-colors"
                >
                    Features
                </a>
                <a
                    href="#workflow"
                    onClick={closeMenu}
                    className="text-gray-900 font-bold text-base px-2 hover:text-[#7C3AED] transition-colors"
                >
                    How It Works
                </a>
                <a
                    href="#pricing"
                    onClick={closeMenu}
                    className="text-gray-900 font-bold text-base px-2 hover:text-[#7C3AED] transition-colors"
                >
                    Pricing
                </a>
                <div className="flex flex-col gap-3 pt-2 border-t border-gray-200">
                    <Link to="/login" onClick={closeMenu}>
                        <button className="w-full border text-[#7C3AED] border-[#7C3AED] py-2 px-5 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                            Login
                        </button>
                    </Link>
                    <Link to="/signup" onClick={closeMenu}>
                        <button className="w-full bg-[#7C3AED] py-2 px-5 rounded-lg text-white font-medium hover:bg-[#6d28d9] transition-colors">
                            Get Started
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
