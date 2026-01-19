import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import requestsRoutes from "./routes/requests.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { User, type UserDoc } from "./models/User";

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://localhost:5173",
    "https://localhost:5174"
  ],
  credentials: true,
}));
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/requests", requestsRoutes);

function toUserResponse(user: UserDoc) {
  return {
    username: user.username,
    fullName: user.fullName || "",
    email: user.email || "",
    avatarUrl: user.avatarUrl || "",
    birthDate: user.birthDate ? user.birthDate.toISOString().split("T")[0] : "",
    gender: user.gender || "",
    phone: user.phone || "",
    city: user.city || "",
    bio: user.bio || ""
  };
}

app.get("/me", authMiddleware, async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user: toUserResponse(user) });
});

app.put("/me", authMiddleware, async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const {
    fullName,
    email,
    avatarUrl,
    birthDate,
    gender,
    phone,
    city,
    bio
  } = req.body as Partial<{
    fullName: string;
    email: string;
    avatarUrl: string;
    birthDate: string;
    gender: string;
    phone: string;
    city: string;
    bio: string;
  }>;

  const update: {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    birthDate?: Date | null;
    gender?: string;
    phone?: string;
    city?: string;
    bio?: string;
  } = {};

  if (typeof fullName === "string") update.fullName = fullName.trim();
  if (typeof email === "string") update.email = email.trim().toLowerCase();
  if (typeof avatarUrl === "string") update.avatarUrl = avatarUrl.trim();
  if (typeof phone === "string") update.phone = phone.trim();
  if (typeof city === "string") update.city = city.trim();
  if (typeof bio === "string") update.bio = bio.trim();
  if (typeof gender === "string") {
    const allowed = new Set(["", "male", "female", "other", "prefer_not_say"]);
    if (!allowed.has(gender)) return res.status(400).json({ error: "invalid gender" });
    update.gender = gender;
  }
  if (typeof birthDate === "string") {
    const trimmed = birthDate.trim();
    if (!trimmed) {
      update.birthDate = null;
    } else {
      const date = new Date(trimmed);
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ error: "invalid birthDate" });
      }
      update.birthDate = date;
    }
  }

  const user = await User.findByIdAndUpdate(userId, update, { new: true });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ user: toUserResponse(user) });
});

export default app;
