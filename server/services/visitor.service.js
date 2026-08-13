const VisitorSession = require("../models/visitorSession.model");
const UAParser = require("ua-parser-js");
let geoip;
try {
    geoip = require("geoip-lite");
} catch (e) {
    geoip = null;
}

const trackVisit = (sessionId, page, req) => {
    if (!sessionId) return Promise.resolve();

    return VisitorSession.findOne({ sessionId })
        .then((session) => {
            const now = new Date();
            
            if (session) {
                // Update existing session
                session.lastVisit = now;
                session.lastActiveAt = now;
                if (!session.pagesVisited.includes(page)) {
                    session.pagesVisited.push(page);
                }
                return session.save();
            } else {
                // Create new session
                let ipAddress = req.ip || req.connection.remoteAddress || "";
                
                // handle IPv6 local
                if (ipAddress === "::1" || ipAddress === "127.0.0.1") {
                    ipAddress = "127.0.0.1";
                }

                const uaString = req.headers["user-agent"] || "";
                const parser = new UAParser(uaString);
                const browser = parser.getBrowser();
                const os = parser.getOS();
                const device = parser.getDevice();

                let country = "";
                let region = "";
                let city = "";

                if (process.env.ENABLE_GEO_ANALYTICS === "true" && geoip && ipAddress && ipAddress !== "127.0.0.1") {
                    const geo = geoip.lookup(ipAddress);
                    if (geo) {
                        country = geo.country || "";
                        region = geo.region || "";
                        city = geo.city || "";
                    }
                }

                return VisitorSession.create({
                    sessionId,
                    pagesVisited: [page],
                    referrer: req.get("referrer") || "",
                    landingPage: page,
                    browser: browser.name || "Unknown",
                    operatingSystem: os.name || "Unknown",
                    deviceType: device.type || "desktop",
                    country,
                    region,
                    city,
                    ipAddress: process.env.ENABLE_GEO_ANALYTICS === "true" ? ipAddress : "",
                });
            }
        })
        .catch((err) => {
            console.error("Failed to track visitor session:", err.message);
        });
};

module.exports = {
    trackVisit,
};
