export default function Workflow() {
    const steps = [
        {
            number: 1,
            title: "Upload",
            description: "Drop your audio or video files into the dashboard.",
        },
        {
            number: 2,
            title: "Transcribe",
            description:
                "Our AI analyzes every word with linguistic precision.",
        },
        {
            number: 3,
            title: "Preview",
            description:
                "Review and edit the interactive transcript instantly.",
        },
        {
            number: 4,
            title: "Download",
            description:
                "Export your perfect subtitles in your favorite format.",
        },
    ];

    return (
        <section className="py-15 md:py-28 bg-gray-50" id="workflow">
            <div className="container text-center px-5">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-gray-900 md:mb-16 mb-10">
                    Simple Workflow, Serious Results
                </h2>

                <div className="relative max-w-5xl mx-auto">
                    {/* connecting line, sits behind the circles, centered on them */}
                    <div className="hidden md:block absolute top-6 left-25 right-25 h-px bg-purple-700 z-0" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className="relative flex flex-col items-center px-2"
                                data-aos="fade-up"
                                data-aos-delay={step.number * 120}
                                data-aos-duration="700"
                            >
                                <div className="relative z-10 w-12 h-12 bg-[#7C3AED] text-white rounded-full flex items-center justify-center text-lg font-bold mb-4">
                                    {step.number}
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-50">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
