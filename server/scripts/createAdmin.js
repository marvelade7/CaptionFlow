const mongoose = require("mongoose");
const User = require("../models/user.model");
const dotenv = require("dotenv");

dotenv.config();

const email = process.argv[2];

if (!email) {
    console.error("Please provide an email address:");
    console.error("Usage: node scripts/createAdmin.js <email>");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB.");
        return User.findOne({ email });
    })
    .then((user) => {
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        if (user.role === "admin") {
            console.log(`User ${email} is already an admin.`);
            process.exit(0);
        }

        user.role = "admin";
        return user.save();
    })
    .then(() => {
        console.log(`Successfully promoted ${email} to admin.`);
        process.exit(0);
    })
    .catch((err) => {
        console.error("Error:", err.message);
        process.exit(1);
    });
