import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

export default app;
