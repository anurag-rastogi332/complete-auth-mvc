import express from "express";
import {
  sendRegisterOTP,
  verifyRegisterOTP,
  resendRegisterOTP,
  login,
  sendResetOTP,
  resetPassword
} from "../controllers/authController.js";

const router = express.Router();

router.post("/send-otp", sendRegisterOTP);
router.post("/verify-otp", verifyRegisterOTP);
router.post("/resend-otp", resendRegisterOTP);
router.post("/login", login);
router.post("/forgot-password", sendResetOTP);
router.post("/reset-password", resetPassword);

export default router;
