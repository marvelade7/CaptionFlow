const express = require("express");
const {
    createUser,
    signInUser,
    getAllUsers,
    getUserById,
    updateUser,
    updateProfilePicture,
} = require("../controllers/user.controller");
const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post("/register", createUser);
router.post("/login", signInUser);
router.get("/users", protect, getAllUsers);
router.get("/me", protect, (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
});
router.get("/users/:id", protect, getUserById);
router.patch("/users/:id", protect, updateUser);
router.patch("/users/:id/profile-picture", protect, upload.single("profilePicture"), updateProfilePicture);

module.exports = router;
