import UploadBox from "./UploadBox";

export default function Hero() {
    return (
        <section className="bg-[#FAF8FF] py-16 md:py-20">
            <div className="flex flex-col gap-12">
                <div className="text-center max-w-3xl mx-auto px-5">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
                        Convert Audio & Video into{" "}
                        <span className="text-[#7C3AED]">
                            Accurate Subtitles
                        </span>{" "}
                        in Seconds
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl md:my-10 text-gray-600 mb-8 leading-relaxed">
                        CaptionFlow leverages cutting-edge AI to deliver
                        accurate transcripts and subtitles for videos, podcasts,
                        and more.
                    </p>
                    <div className="flex flex-col sm:flex-row md:gap-8 gap-4 justify-center flex-wrap">
                        <button className="bg-[#7C3AED] py-2 px-8 text-white font-medium rounded-4xl text-sm md:text-base cursor-pointer">
                            Get Transcripts
                        </button>
                        <button className="bg-transparent border py-2 px-8 text-[#7C3AED] font-medium rounded-4xl text-sm md:text-base cursor-pointer">
                            See Demo
                        </button>
                    </div>
                </div>

                <UploadBox />
            </div>
        </section>
    );
}
