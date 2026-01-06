import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "";

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid Authorization header" });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ message: "Server misconfigured: JWT_SECRET is missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === "string") {
      req.userId = payload;
    } else if ("sub" in payload && payload.sub) {
      req.userId = String(payload.sub);
    } else if ("userId" in payload && payload.userId) {
      req.userId = String(payload.userId);
    }

    if (!req.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
