import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import UploadBox from "./UploadBox";

export default function Hero() {
    const { user } = useAuth();
    const ctaTarget = user ? "/dashboard/upload" : "/signup";

    return (
        <section className="bg-[#FAF8FF] py-16 md:py-20">
            <div className="flex flex-col gap-12">
                <div
                    className="text-center max-w-3xl mx-auto px-5"
                    data-aos="fade-up"
                    data-aos-duration="900"
                >
                    <h1
                        className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6"
                        data-aos="fade-up"
                        data-aos-delay="100"
                    >
                        Convert Audio & Video into{" "}
                        <span className="text-[#7C3AED]">
                            Accurate Subtitles
                        </span>{" "}
                        in Seconds
                    </h1>
                    <p
                        className="text-base sm:text-lg md:text-xl md:my-10 text-gray-600 mb-8 leading-relaxed"
                        data-aos="fade-up"
                        data-aos-delay="200"
                    >
                        CaptionFlow leverages cutting-edge AI to deliver
                        accurate transcripts and subtitles for videos, podcasts,
                        and more.
                    </p>
                    <div
                        className="flex flex-col sm:flex-row md:gap-8 gap-4 justify-center flex-wrap"
                        data-aos="fade-up"
                        data-aos-delay="300"
                    >
                        <Link to={ctaTarget}>
                            <button className="w-full sm:w-auto bg-[#7C3AED] py-3 px-8 text-white font-semibold rounded-full text-sm md:text-base cursor-pointer hover:bg-[#6d28d9] transition-all shadow-md hover:shadow-lg">
                                Start Transcribing Free
                            </button>
                        </Link>
                        <a href="#workflow">
                            <button className="w-full sm:w-auto bg-white border border-[#7C3AED] py-3 px-8 text-[#7C3AED] font-semibold rounded-full text-sm md:text-base cursor-pointer hover:bg-[#f5f3ff] transition-all shadow-xs">
                                How It Works
                            </button>
                        </a>
                    </div>
                </div>

                <div
                    data-aos="zoom-in"
                    data-aos-duration="900"
                    data-aos-delay="150"
                >
                    <UploadBox />
                </div>
            </div>
        </section>
    );
}
