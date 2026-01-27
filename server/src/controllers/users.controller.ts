import type { Request, Response } from "express";
import { User, type UserDoc } from "../models/User";
import { buildUploadUrl } from "../lib/uploads";

function toUserResponse(user: UserDoc) {
  return {
    userId: String(user._id),
    username: user.username,
    fullName: user.fullName || "",
    email: user.email || "",
    avatarUrl: user.avatarUrl || "",
    birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : "",
    gender: user.gender || "",
    phone: user.phone || "",
    city: user.city || "",
    bio: user.bio || "",
  };
}

async function ensureUniqueUsername(username: string, userId: string) {
  const existing = await User.findOne({ username, _id: { $ne: userId } });
  return !existing;
}

export const usersController = {
  async getMe(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user: toUserResponse(user) });
  },

  async updateMe(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const { username, avatarUrl } = req.body as Partial<{ username: string; avatarUrl: string }>;
    const update: { username?: string; avatarUrl?: string } = {};

    if (typeof username === "string") {
      const trimmed = username.trim();
      if (!trimmed) return res.status(400).json({ error: "invalid username" });
      const ok = await ensureUniqueUsername(trimmed, userId);
      if (!ok) return res.status(409).json({ error: "username already exists" });
      update.username = trimmed;
    }

    if (typeof avatarUrl === "string") {
      update.avatarUrl = avatarUrl.trim();
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user: toUserResponse(user) });
  },

  async updateMeWithAvatar(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const { username } = req.body as Partial<{ username: string }>;
    const update: { username?: string; avatarUrl?: string } = {};

    if (typeof username === "string") {
      const trimmed = username.trim();
      if (!trimmed) return res.status(400).json({ error: "invalid username" });
      const ok = await ensureUniqueUsername(trimmed, userId);
      if (!ok) return res.status(409).json({ error: "username already exists" });
      update.username = trimmed;
    }

    if (req.file) {
      update.avatarUrl = buildUploadUrl(req, `/uploads/avatars/${req.file.filename}`);
    }

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user: toUserResponse(user) });
  },
};
