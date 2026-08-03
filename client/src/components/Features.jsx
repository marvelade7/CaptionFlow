import LightningFill from "bootstrap-icons/icons/lightning-fill.svg";
import Bullseye from "bootstrap-icons/icons/bullseye.svg";
import FileText from "bootstrap-icons/icons/file-text.svg";
import MicFill from "bootstrap-icons/icons/mic-fill.svg";
import ShieldLock from "bootstrap-icons/icons/shield-lock.svg";
import GearFill from "bootstrap-icons/icons/gear-fill.svg";

export default function Features() {
    const features = [
        {
            icon: LightningFill,
            title: "Fast AI",
            description:
                "Get transcripts in seconds with our advanced AI technology",
        },
        {
            icon: Bullseye,
            title: "High Accuracy",
            description:
                "99% accuracy rate with support for multiple languages and accents",
        },
        {
            icon: FileText,
            title: "Multiple Formats",
            description:
                "Export to TXT, SRT, ASS, and more for easy integration with any tool",
        },
        {
            icon: MicFill,
            title: "Speaker Diarization",
            description:
                "Automatically identify and label different speakers in your audio",
        },
        {
            icon: ShieldLock,
            title: "Secure Processing",
            description:
                "Your files are encrypted and processed securely in the cloud",
        },
        {
            icon: GearFill,
            title: "Auto-Diarization",
            description:
                "Smart speaker identification for podcast and interview content",
        },
    ];

    return (
        <section className="features" id="features">
            <div className="container">
                <h2>Powerful Features for Precision</h2>
                <p className="section-subtitle">
                    Everything you need for professional-quality transcription
                </p>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">
                                <img src={feature.icon} alt={feature.title} />
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
