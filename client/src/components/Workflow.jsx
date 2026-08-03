export default function Workflow() {
    const steps = [
        {
            number: "1",
            title: "Upload",
            description: "Upload your audio or video file",
        },
        {
            number: "2",
            title: "Transcribe",
            description: "Our AI transcribes your content",
        },
        {
            number: "3",
            title: "Process",
            description: "Generate subtitles and translations",
        },
        {
            number: "4",
            title: "Download",
            description: "Download in your preferred format",
        },
    ];

    return (
        <section className="workflow" id="workflow">
            <div className="container">
                <h2>Simple Workflow, Serious Results</h2>

                <div className="workflow-steps">
                    {steps.map((step, index) => (
                        <div key={index}>
                            <div className="step">
                                <div className="step-number">{step.number}</div>
                                <h3>{step.title}</h3>
                                <p>{step.description}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className="step-arrow">→</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
