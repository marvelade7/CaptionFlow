export default function Features() {
    const icon = {
        fontSize: "2em",
        color: "#7C3AED",
    };
    const features = [
        {
            icon: "bi bi-lightning-fill",
            title: "Fast AI",
            description:
                "Get transcripts in seconds with our advanced AI technology",
        },
        {
            icon: "bi bi-bullseye",
            title: "High Accuracy",
            description:
                "99% accuracy rate with support for multiple languages and accents",
        },
        {
            icon: "bi bi-file-text-fill",
            title: "Multiple Formats",
            description:
                "Export to TXT, SRT, ASS, and more for easy integration with any tool",
        },
        {
            icon: "bi bi-mic-fill",
            title: "Speaker Diarization",
            description:
                "Automatically identify and label different speakers in your audio",
        },
        {
            icon: "bi bi-shield-lock",
            title: "Secure Processing",
            description:
                "Your files are encrypted and processed securely in the cloud",
        },
        {
            icon: "bi bi-gear-fill",
            title: "Auto-Diarization",
            description:
                "Smart speaker identification for podcast and interview content",
        },
    ];

    return (
        <section className="py-5 md:py-28 bg-[#FAF8FF]" id="features">
            <div className="max-w-6xl mx-auto px-5 text-center">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-4">
                    Powerful Features for Precision
                </h2>
                <p className="text-md text-gray-600 mb-16">
                    Everything you need for professional-quality transcription
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white border border-purple-200 p-8 rounded-xl text-center transition-all hover:shadow-md hover:-translate-y-2 duration-300"
                            data-aos="fade-up"
                            data-aos-delay={index * 80}
                            data-aos-duration="700"
                        >
                            <div className="flex justify-center items-center mb-4">
                                <i className={feature.icon} style={icon}></i>
                            </div>
                            <h3 className="md:text-xl text-lg font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
