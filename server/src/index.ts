import "dotenv/config";
import app from "./config/app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("Missing MONGO_URI in .env");

  await connectDB(mongoUri);

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
