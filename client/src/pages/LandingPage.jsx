import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Workflow from "../components/Workflow";
import Footer from "../components/Footer";

export default function LandingPage() {
    return (
        <div className="app">
            <Navbar />
            <Hero />
            <Features />
            <Workflow />
            <Footer />
        </div>
    );
}
