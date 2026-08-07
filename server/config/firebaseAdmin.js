const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    : require("../serviceAccountKey.json");

initializeApp({
    credential: cert(serviceAccount),
});

const auth = getAuth();

module.exports = auth;