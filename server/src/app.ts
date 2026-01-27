import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import requestsRoutes from "./routes/requests.routes";
import usersRoutes from "./routes/users.routes";
import postsRoutes from "./routes/posts.routes";
import commentsRoutes from "./routes/comments.routes";
import likesRoutes from "./routes/likes.routes";
import aiRoutes from "./routes/ai.routes";
import { getUploadsRoot } from "./lib/uploads";

const app = express();

app.use(cors({
  origin: ["https://localhost:5173", "https://localhost:5174"],
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(getUploadsRoot()));

app.use("/auth", authRoutes);

app.use("/requests", requestsRoutes);

app.use("/users", usersRoutes);
app.use("/", usersRoutes);
app.use("/posts", postsRoutes);
app.use("/posts", commentsRoutes);
app.use("/posts", likesRoutes);
app.use("/ai", aiRoutes);

export default app;
