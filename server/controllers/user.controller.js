const fs = require("fs");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary.config");

// Create a new user
const createUser = (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All fields are required.",
        });
    }

    User.findOne({ email })
        .then((existingUser) => {
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "User already exists.",
                });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);

            const newUser = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
            });

            return newUser.save();
        })
        .then((user) => {
            if (!user) return;

            const userData = user.toObject();
            delete userData.password;

            res.status(201).json({
                success: true,
                message: "User created successfully.",
                user: userData,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        });
};

// Sign in a user
const signInUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required.",
        });
    }

    User.findOne({ email })
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            const isPasswordCorrect = bcrypt.compareSync(
                password,
                user.password
            );

            if (!isPasswordCorrect) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password.",
                });
            }

            const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET,
                {
                    expiresIn: "2h",
                }
            );

            const userData = user.toObject();
            delete userData.password;

            res.status(200).json({
                success: true,
                message: "Sign in successful.",
                token,
                user: userData,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        });
};

// Get all users
const getAllUsers = (req, res) => {
    User.find().select("-password")
        .then((users) => {
            res.status(200).json({
                success: true,
                users,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        });
};

// Get user by ID
const getUserById = (req, res) => {
    const { id } = req.params;

    User.findById(id).select("-password")
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            res.status(200).json({
                success: true,
                user,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        });
};

// Update user profile (text fields)
const updateUser = (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, username } = req.body;

    // Compare as strings — req.user.id is an ObjectId
    if (req.user.id.toString() !== id) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized",
        });
    }

    User.findByIdAndUpdate(
        id,
        { firstName, lastName, email, username },
        { new: true }   // return the updated document, not the old one
    )
        .select("-password")
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found.",
                });
            }

            res.status(200).json({
                success: true,
                user,
            });
        })
        .catch((err) => {
            res.status(500).json({
                success: false,
                message: err.message,
            });
        });
};

// Update profile picture
const updateProfilePicture = (req, res) => {
    const { id } = req.params;

    if (req.user.id.toString() !== id) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized",
        });
    }

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No image file uploaded.",
        });
    }

    // Find the user first so we can delete their old picture from Cloudinary
    User.findById(id)
        .then((user) => {
            if (!user) {
                throw Object.assign(new Error("User not found."), { status: 404 });
            }

            // Delete old profile picture from Cloudinary if it exists
            const deleteOld = user.profilePicture
                ? cloudinary.uploader.destroy(
                      user.profilePicture
                          .split("/")
                          .slice(-2)
                          .join("/")
                          .replace(/\.[^/.]+$/, "") // strip file extension to get public_id
                  )
                : Promise.resolve();

            return deleteOld.then(() =>
                cloudinary.uploader.upload(req.file.path, {
                    folder: "profile_pictures",
                    resource_type: "image",
                    transformation: [
                        { width: 400, height: 400, crop: "fill", gravity: "face" },
                    ],
                })
            );
        })
        .then((result) => {
            // Remove the temp file from disk
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

            return User.findByIdAndUpdate(
                id,
                { profilePicture: result.secure_url },
                { new: true }
            ).select("-password");
        })
        .then((user) => {
            res.status(200).json({
                success: true,
                message: "Profile picture updated.",
                user,
            });
        })
        .catch((err) => {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            res.status(err.status || 500).json({
                success: false,
                message: err.message,
            });
        });
};

module.exports = {
    createUser,
    signInUser,
    getAllUsers,
    getUserById,
    updateUser,
    updateProfilePicture,
};