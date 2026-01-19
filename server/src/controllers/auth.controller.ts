import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { type Secret } from "jsonwebtoken";
import { User } from "../models/User";

function signAccessToken(payload: { userId: string; username: string }) {
  const secret = process.env.JWT_SECRET as Secret;
  if (!secret) throw new Error("Missing JWT_SECRET");

  const expiresIn = (process.env.JWT_EXPIRES_IN || "1h") as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, secret, { expiresIn });
}

function signRefreshToken(payload: { userId: string }) {
  const secret = (process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET) as Secret;
  if (!secret) throw new Error("Missing REFRESH_TOKEN_SECRET or JWT_SECRET");

  const expiresIn = (process.env.REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
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

    const accessToken = signAccessToken({ userId: String(user._id), username: user.username });
    const refreshToken = signRefreshToken({ userId: String(user._id) });

    // store refresh token for revocation/rotation
    user.refreshTokens = (user.refreshTokens || []).concat(refreshToken);
    await user.save();

    return res.status(201).json({ token: accessToken, refreshToken });
  },

  async login(req: Request, res: Response) {
    const { username, password } = req.body as { username?: string; password?: string };

    if (!username || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const accessToken = signAccessToken({ userId: String(user._id), username: user.username });
    const refreshToken = signRefreshToken({ userId: String(user._id) });

    user.refreshTokens = (user.refreshTokens || []).concat(refreshToken);
    await user.save();

    return res.json({ token: accessToken, refreshToken });
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) return res.status(400).json({ error: "refreshToken is required" });

    const secret = (process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET) as Secret;
    try {
      const payload = jwt.verify(refreshToken, secret) as { userId?: string };
      if (!payload.userId) return res.status(401).json({ error: "Invalid token payload" });

      const user = await User.findById(payload.userId);
      if (!user) return res.status(401).json({ error: "User not found" });

      // check token exists (not revoked)
      if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
        return res.status(403).json({ error: "Refresh token revoked" });
      }

      // rotate tokens: remove old refresh token and add a new one
      const newRefresh = signRefreshToken({ userId: String(user._id) });
      user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken).concat(newRefresh);
      await user.save();

      const accessToken = signAccessToken({ userId: String(user._id), username: user.username });
      return res.json({ token: accessToken, refreshToken: newRefresh });
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
  },

  async logout(req: Request, res: Response) {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) return res.status(400).json({ error: "refreshToken is required" });

    // try to decode to find userId (if token already invalid, just return success)
    const secret = (process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET) as Secret;
    try {
      const payload = jwt.verify(refreshToken, secret) as { userId?: string };
      if (payload.userId) {
        const user = await User.findById(payload.userId);
        if (user && user.refreshTokens && user.refreshTokens.includes(refreshToken)) {
          user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken);
          await user.save();
        }
      }
    } catch (_) {
      // ignore invalid token
    }

    return res.status(204).send();
  }
};
