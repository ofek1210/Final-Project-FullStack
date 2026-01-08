"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getProfile = getProfile;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
function signToken(userId) {
    const secret = process.env.JWT_SECRET ?? "";
    if (!secret)
        throw new Error("Missing JWT_SECRET in environment");
    return jsonwebtoken_1.default.sign({ sub: userId }, secret, { expiresIn: JWT_EXPIRES_IN });
}
async function register(req, res) {
    try {
        const { username, password } = req.body ?? {};
        if (!username || !password) {
            return res.status(400).json({ message: "username and password are required" });
        }
        const existingUser = await User_1.User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const user = await User_1.User.create({ username, passwordHash });
        const token = signToken(user.id);
        return res.status(201).json({
            user: { id: user.id, username: user.username, createdAt: user.createdAt, updatedAt: user.updatedAt },
            token
        });
    }
    catch (err) {
        const message = err?.message || "Failed to register";
        return res.status(500).json({ message });
    }
}
async function login(req, res) {
    try {
        const { username, password } = req.body ?? {};
        if (!username || !password) {
            return res.status(400).json({ message: "username and password are required" });
        }
        const user = await User_1.User.findOne({ username });
        if (!user)
            return res.status(401).json({ message: "Invalid username or password" });
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid username or password" });
        const token = signToken(user.id);
        return res.json({
            user: { id: user.id, username: user.username, createdAt: user.createdAt, updatedAt: user.updatedAt },
            token
        });
    }
    catch (err) {
        const message = err?.message || "Failed to login";
        return res.status(500).json({ message });
    }
}
async function getProfile(req, res) {
    try {
        if (!req.userId)
            return res.status(401).json({ message: "Unauthorized" });
        const user = await User_1.User.findById(req.userId).select("username createdAt updatedAt");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        return res.json({
            user: { id: user.id, username: user.username, createdAt: user.createdAt, updatedAt: user.updatedAt }
        });
    }
    catch (err) {
        const message = err?.message || "Failed to fetch profile";
        return res.status(500).json({ message });
    }
}
