export default function Navbar() {
    return (
        <nav className="sticky top-0 z-100 lg:px-35 px-5  bg-[#FAF8FF] border-b border-gray-200 shadow-sm">
            <div className="flex justify-between items-center py-4">
                <div className="">
                    <h2 className="text-[#7C3AED] font-semibold md:text-2xl text-xl">
                        CaptionFlow
                    </h2>
                </div>
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
                <div className="hidden md:flex items-center gap-5">
                    <button className="border text-[#7C3AED] border-[#7C3AED] py-2 px-5 rounded-lg cursor-pointer font-medium hover:bg-gray-100 transition-colors">
                        Login
                    </button>
                    <button className="border bg-[#7C3AED] py-2 px-5 rounded-lg text-white font-medium cursor-pointer">
                        Get Started
                    </button>
                </div>
                <i className="block bg-[#7c3aedd2] text-white rounded-sm py- px-2 md:hidden bi bi-list text-2xl"></i>
            </div>
        </nav>
    );
}
