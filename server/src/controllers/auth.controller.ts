import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { type Secret } from "jsonwebtoken";
import { User } from "../models/User";

function signToken(payload: { userId: string; username: string }) {
  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) throw new Error("Missing JWT_SECRET");

  const expiresIn = (process.env.JWT_EXPIRES_IN || "1h") as jwt.SignOptions["expiresIn"];

  return jwt.sign(payload, secret, { expiresIn });
}

export const authController = {
  async register(req: Request, res: Response) {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "password must be at least 6 chars" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ error: "username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });

    const token = signToken({ userId: String(user._id), username: user.username });
    return res.status(201).json({ token });
  },

  async login(req: Request, res: Response) {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    const token = signToken({ userId: String(user._id), username: user.username });
    return res.json({ token });
  }
};
