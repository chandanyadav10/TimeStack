import express from "express";
import { loginUser, registerUser, logoutUser , getUser, updateUser, loginStatus, verifyEmail, verifyUser, forgotPassword, resetPassword, changePassword} from "../controllers/auth/userController.js";
import { adminMiddleware, creatorMiddleware, protect } from "../middlewares/authMiddleware.js";
import { deleteUser, getAllUsers } from "../controllers/auth/adminController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login",loginUser);
router.get("/logout", logoutUser);
router.get("/user", protect, getUser);
router.patch("/user", protect, updateUser);

// admin routes
router.delete("/admin/user/:id",protect, adminMiddleware, deleteUser);
// get all users
router.get("/admin/users",protect, creatorMiddleware, getAllUsers);

// login user status
router.get("/login-status", loginStatus);

// verify email
router.post("/verify-email", protect,  verifyEmail);

// verify user
router.post("/verify-user/:verificationToken", protect,  verifyUser);

// forgot password
router.post("/forgot-password", forgotPassword);

// reset password
router.post("/reset-password/:resetPasswordToken", resetPassword);

// change password
<<<<<<< HEAD
router.post("/change-password", protect, changePassword);
=======
router.patch("/change-password", protect, changePassword);
>>>>>>> staging

export default router;