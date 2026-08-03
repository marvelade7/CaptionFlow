const express = require("express");
const {
    createUser,
    signInUser,
    getAllUsers,
    getUserById,
} = require("../controllers/user.controller");
const protect = require("../middleware/auth.middleware");

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

module.exports = router;
