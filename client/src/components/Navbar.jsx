export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-brand">
                    <h2>CaptionFlow</h2>
                </div>
                <div className="navbar-menu hidden ">
                    <a href="#features">Features</a>
                    <a href="#workflow">How It Works</a>
                    <a href="#pricing">Pricing</a>
                </div>
                <button className="btn-login">Login</button>
            </div>
        </nav>
    );
}
