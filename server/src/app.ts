import express from "express";
import authRoutes from "./routes/auth.routes";
import { authMiddleware } from "./middleware/auth.middleware";

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.get("/me", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});


export default app;
