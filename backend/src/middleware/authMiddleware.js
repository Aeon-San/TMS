import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { COOKIE_NAME } from "../config/security.js";

export const protect = async (req, res, next) => {
    try {
        const token = req.cookies[COOKIE_NAME];

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(new mongoose.Types.ObjectId(decoded.userId)).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({ message: "Not authorized, invalid token" });
    }
};
