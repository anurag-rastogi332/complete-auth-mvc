import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  deleteUser
} from "../controllers/userController.js";
import {
  authMiddleware,
  adminMiddleware
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.get("/admin/users", authMiddleware, adminMiddleware, getUsers);
router.delete("/admin/users/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;
