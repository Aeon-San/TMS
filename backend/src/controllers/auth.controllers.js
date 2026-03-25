import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import os from "node:os";
import User from "../models/user.model.js";
import generateToken, { clearAuthCookie } from "../library/token.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../library/cloudinary.js";
import { sendError, sendSuccess } from "../library/apiResponse.js";
import { sanitizeText } from "../library/sanitize.js";
import { logger } from "../library/logger.js";
import { COOKIE_NAME } from "../config/security.js";

const buildUsernameBase = (name, email) => {
  const source = String(name || email || "user")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 18);

  return source || "user";
};

const createAvailableUsername = async (name, email, excludeUserId = null) => {
  const base = buildUsernameBase(name, email);
  let username = base;
  let counter = 0;

  while (true) {
    const existingUser = await User.findOne({
      username,
      ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {}),
    }).select("_id");

    if (!existingUser) {
      return username;
    }

    counter += 1;
    username = `${base.slice(0, Math.max(1, 20 - String(counter).length))}${counter}`;
  }
};

export const signup = async (req, res) => {
  const name = sanitizeText(req.body.name, { maxLength: 80 });
  const email = String(req.body.email || "").trim().toLowerCase();
  const { password } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return sendError(res, 409, "This email is already used!");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const username = await createAvailableUsername(name, email);
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    await generateToken(newUser, res);

    return sendSuccess(res, 201, {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
      message: "Signup successful!",
    });
  } catch (error) {
    logger.error("Signup error", { message: error.message });
    return sendError(res, 500, "Error during signup!");
  }
};

export const login = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const { password } = req.body;

  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (token) {
      clearAuthCookie(res);
    }

    const user = await User.findOne({ email }).select("+password +sessionVersion +sessionExpiresAt");
    if (!user) {
      return sendError(res, 400, "Invalid email, please signup!");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return sendError(res, 400, "Invalid password!");
    }

    await generateToken(user, res);
    return sendSuccess(res, 200, {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username || await createAvailableUsername(user.name, user.email, user._id),
      role: user.role,
      message: "Login successful!",
    });
  } catch (error) {
    logger.error("Login error", { message: error.message });
    return sendError(res, 500, "Internal server error!");
  }
};

export const forgotPassword = async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  try {
    const user = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpiresAt");

    if (!user) {
      return sendError(res, 404, "No account found with this email!");
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 15);
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${rawToken}`;

    return sendSuccess(res, 200, {
      message: "Password reset link generated successfully.",
      resetUrl,
    });
  } catch (error) {
    logger.error("Forgot password error", { message: error.message });
    return sendError(res, 500, "Unable to process forgot password request!");
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: { $gt: new Date() },
    }).select("+password +resetPasswordToken +resetPasswordExpiresAt +sessionVersion +sessionExpiresAt");

    if (!user) {
      return sendError(res, 400, "Reset link is invalid or expired!");
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    user.sessionExpiresAt = null;
    await user.save();

    return sendSuccess(res, 200, { message: "Password reset successful! Please login." });
  } catch (error) {
    logger.error("Reset password error", { message: error.message });
    return sendError(res, 500, "Unable to reset password!");
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found!");
    }

    return sendSuccess(res, 200, {
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username || buildUsernameBase(user.name, user.email),
      role: user.role,
      avatar: user.avatar,
      profilePic: user.profilePic,
      profilePicPublicId: user.profilePicPublicId,
      uploadedAt: user.uploadedAt,
      lastLoginAt: user.lastLoginAt,
      lastActiveAt: user.lastActiveAt,
      preferences: user.preferences,
    });
  } catch (error) {
    logger.error("Get user error", { message: error.message });
    return sendError(res, 500, "Unable to fetch user");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("+sessionVersion +sessionExpiresAt");
    if (!user) {
      return sendError(res, 404, "User not found!");
    }

    const nextName = req.body.name !== undefined ? sanitizeText(req.body.name, { maxLength: 80 }) : user.name;
    const nextEmail = req.body.email !== undefined ? String(req.body.email || "").trim().toLowerCase() : user.email;
    const requestedUsername = req.body.username !== undefined
      ? sanitizeText(req.body.username, { maxLength: 24 }).toLowerCase()
      : user.username;

    if (nextEmail !== user.email) {
      const emailOwner = await User.findOne({ email: nextEmail, _id: { $ne: user._id } }).select("_id");
      if (emailOwner) {
        return sendError(res, 409, "This email is already used!");
      }
    }

    let nextUsername = requestedUsername;
    if (!nextUsername) {
      nextUsername = await createAvailableUsername(nextName, nextEmail, user._id);
    } else {
      const usernameOwner = await User.findOne({ username: nextUsername, _id: { $ne: user._id } }).select("_id");
      if (usernameOwner) {
        return sendError(res, 409, "This username is already taken!");
      }
    }

    user.name = nextName;
    user.email = nextEmail;
    user.username = nextUsername;

    if (req.body.preferences && typeof req.body.preferences === "object") {
      user.preferences = {
        ...user.preferences?.toObject?.(),
        ...user.preferences,
        ...Object.fromEntries(
          Object.entries(req.body.preferences).map(([key, value]) => [key, Boolean(value)])
        ),
      };
    }

    await user.save();

    return sendSuccess(res, 200, {
      message: "Profile updated successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        profilePic: user.profilePic,
        profilePicPublicId: user.profilePicPublicId,
        lastLoginAt: user.lastLoginAt,
        lastActiveAt: user.lastActiveAt,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    logger.error("Update profile error", { message: error.message });
    return sendError(res, 500, "Unable to update profile!");
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId).select("+password +sessionVersion +sessionExpiresAt");
    if (!user) {
      return sendError(res, 404, "User not found!");
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return sendError(res, 400, "Current password is incorrect!");
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return sendError(res, 400, "New password must be different from the current password!");
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.sessionVersion = (user.sessionVersion || 0) + 1;
    user.sessionExpiresAt = null;
    await user.save();

    clearAuthCookie(res);

    return sendSuccess(res, 200, { message: "Password changed successfully. Please login again." });
  } catch (error) {
    logger.error("Change password error", { message: error.message });
    return sendError(res, 500, "Unable to change password!");
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return sendError(res, 400, "No user logged in!");
    }

    await User.findByIdAndUpdate(req.userId, {
      $inc: { sessionVersion: 1 },
      $set: { sessionExpiresAt: null },
    });

    clearAuthCookie(res);

    return sendSuccess(res, 200, { message: "Logout successful!" });
  } catch (error) {
    logger.error("Logout error", { message: error.message });
    return sendError(res, 500, "Internal server error!");
  }
};

export const profilePicUpload = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return sendError(res, 400, "No file provided!");

    const result = await uploadOnCloudinary(file.path);
    if (!result.success || !result.url) return sendError(res, 500, "Cloudinary upload failed!");

    const { url, public_id } = result;

    const user = await User.findById(req.userId);
    if (!user) return sendError(res, 404, "User not found!");

    if (user.profilePicPublicId) {
      await deleteFromCloudinary(user.profilePicPublicId);
    }

    user.profilePic = url;
    user.profilePicPublicId = public_id;
    await user.save();

    return sendSuccess(res, 200, {
      message: "Profile picture updated!",
      url,
      publicId: public_id,
    });
  } catch (error) {
    logger.error("Upload error", { message: error.message });
    return sendError(res, 500, "Upload failed!");
  }
};

export const deleteProfilePic = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return sendError(res, 404, "User not found!");
    if (!user.profilePicPublicId) return sendError(res, 400, "No profile picture to delete!");

    await deleteFromCloudinary(user.profilePicPublicId);
    user.profilePic = "";
    user.profilePicPublicId = null;
    await user.save();

    return sendSuccess(res, 200, { message: "Profile picture deleted!" });
  } catch (error) {
    logger.error("Delete profile picture error", { message: error.message });
    return sendError(res, 500, "Delete failed!");
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return sendError(res, 404, "User not found!");

    if (user.profilePicPublicId) {
      await deleteFromCloudinary(user.profilePicPublicId);
    }

    await User.findByIdAndDelete(req.userId);
    clearAuthCookie(res);

    return sendSuccess(res, 200, { message: "Account deleted!" });
  } catch (error) {
    logger.error("Delete account error", { message: error.message });
    return sendError(res, 500, "Account deletion failed!");
  }
};

export const systeminfo = (req, res) => {
  const totalRAM = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
  const freeRAM = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
  const usedRAM = (totalRAM - freeRAM).toFixed(2);

  return sendSuccess(res, 200, {
    totalRAM: `${totalRAM} GB`,
    freeRAM: `${freeRAM} GB`,
    usedRAM: `${usedRAM} GB`,
  });
};
