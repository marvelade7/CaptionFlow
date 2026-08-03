export default function Footer() {
    return (
        <footer
            className="bg-gray-900 text-white pt-20 pb-8 md:px-30 px-10"
            data-aos="fade-up"
            data-aos-duration="900"
        >
            <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-12"
                data-aos="fade-up"
                data-aos-duration="900"
            >
                <div>
                    <h4 className="text-lg font-bold mb-4">CaptionFlow</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Convert Audio & Video into Accurate Subtitles in Seconds
                    </p>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-4">Product</h4>
                    <ul className="space-y-2">
                        <li>
                            <a
                                href="#features"
                                className="text-gray-400 hover:text-primary text-sm transition-colors"
                            >
                                Features
                            </a>
                        </li>
                        <li>
                            <a
                                href="#pricing"
                                className="text-gray-400 hover:text-primary text-sm transition-colors"
                            >
                                Pricing
                            </a>
                        </li>
                        <li>
                            <a
                                href="#api"
                                className="text-gray-400 hover:text-primary text-sm transition-colors"
                            >
                                API
                            </a>
                        </li>
                        <li>
                            <a
                                href="#security"
                                className="text-gray-400 hover:text-primary text-sm transition-colors"
                            >
                                Security
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-4">Company</h4>
                    <ul className="space-y-2">
                        <li>
                            <a
                                href="#about"
                                className="text-gray-400 hover:text-primary text-sm transition-colors"
                            >
                                About Us
                            </a>
                        </li>
                        <li>
                            <a
                                href="#blog"
                                className="text-gray-400 hover:text-primary text-sm transition-colors"
                            >
                                Blog
                            </a>
                        </li>
                        <li>
                            <a
                                href="#careers"
                                className="text-gray-400 hover:text-primary text-sm transition-colors"
                            >
                                Careers
                            </a>
                        </li>
                        <li>
                            <a
                                href="#contact"
                                className="text-gray-400 hover:text-primary text-sm transition-colors"
                            >
                                Contact
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-4">Legal</h4>
                    <ul className="space-y-2">
                        <li>
                            <a
                                href="#privacy"
                                className="text-gray-400 hover:text-primary text-sm transition-colors"
                            >
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a
                                href="#terms"
                                className="text-gray-400 hover:text-primary text-sm transition-colors"
                            >
                                Terms of Service
                            </a>
                        </li>
                        <li>
                            <a
                                href="#cookies"
                                className="text-gray-400 hover:text-primary text-sm transition-colors"
                            >
                                Cookie Policy
                            </a>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-lg font-bold mb-4">Connect</h4>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="#twitter"
                            className="text-gray-400 hover:text-primary text-sm transition-colors"
                        >
                            Twitter
                        </a>
                        <a
                            href="#github"
                            className="text-gray-400 hover:text-primary text-sm transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="#linkedin"
                            className="text-gray-400 hover:text-primary text-sm transition-colors"
                        >
                            LinkedIn
                        </a>
                        <a
                            href="#facebook"
                            className="text-gray-400 hover:text-primary text-sm transition-colors"
                        >
                            Facebook
                        </a>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-8 text-center">
                <p className="text-gray-400 text-sm mb-2">
                    &copy; 2026 CaptionFlow. All rights reserved.
                </p>
                <p className="text-gray-400 text-sm">
                    Made with ❤️ by marvelade
                </p>
            </div>
        </footer>
    );
}
