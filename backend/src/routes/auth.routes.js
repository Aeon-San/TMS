import express from "express";
import {
  login,
  logout,
  signup,
  profilePicUpload,
  deleteProfilePic,
  deleteAccount,
  systeminfo,
  getUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
} from "../controllers/auth.controllers.js";
import { authCheck } from "../middleware/authCheck.js";
import { upload } from "../middleware/multer.middleware.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  validateForgotPassword,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateResetPassword,
  validateSignup,
} from "../validators/auth.validators.js";

const router = express.Router();

router.post("/signup", validateRequest(validateSignup), signup);
router.post("/login", validateRequest(validateLogin), login);
router.post("/forgot-password", validateRequest(validateForgotPassword), forgotPassword);
router.post("/reset-password/:token", validateRequest(validateResetPassword), resetPassword);
router.post("/logout", authCheck, logout);
router.patch("/profile", authCheck, validateRequest(validateProfileUpdate), updateProfile);
router.post("/change-password", authCheck, validateRequest(validatePasswordChange), changePassword);
router.get("/check", authCheck, (req, res) => res.status(200).json({ authenticated: true }));
router.post("/profilepic", authCheck, upload.single("profilePic"), profilePicUpload);
router.delete("/profilepic", authCheck, deleteProfilePic);
router.delete("/delete-account", authCheck, deleteAccount);
router.get("/systeminfo", systeminfo);
router.get("/getuser", authCheck, getUser);

export default router;
