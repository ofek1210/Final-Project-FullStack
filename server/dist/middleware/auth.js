"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET ?? "";
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }
    if (!JWT_SECRET) {
        return res.status(500).json({ message: "Server misconfigured: JWT_SECRET is missing" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof payload === "string") {
            req.userId = payload;
        }
        else if ("sub" in payload && payload.sub) {
            req.userId = String(payload.sub);
        }
        else if ("userId" in payload && payload.userId) {
            req.userId = String(payload.userId);
        }
        if (!req.userId) {
            return res.status(401).json({ message: "Invalid token payload" });
        }
        return next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
