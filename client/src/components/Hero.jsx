import UploadBox from "./UploadBox";

export default function Hero() {
    return (
        <section className="hero">
            <div className="container">
                <div className="hero-content">
                    <h1>
                        Convert Audio & Video into Accurate Subtitles in Seconds
                    </h1>
                    <p>
                        CaptionFlow leverages cutting-edge AI to deliver
                        accurate transcripts and subtitles for videos, podcasts,
                        and more.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-primary">Get Transcripts</button>
                        <a href="#" className="btn-secondary">
                            See Demo
                        </a>
                    </div>
                </div>

                <UploadBox />
            </div>
        </section>
    );
}
