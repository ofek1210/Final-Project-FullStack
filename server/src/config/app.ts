import express from "express";
import cors from "cors";
import authRoutes from "../routes/authRoutes";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);

export default app;
