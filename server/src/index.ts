import "dotenv/config";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import app from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT);

function resolveCertPath(filePath: string) {
  return path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, "..", filePath);
}

async function main() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error("Missing MONGO_URI");

  await connectDB(mongoUri);

  const keyPath = process.env.SSL_KEY_PATH;
  const certPath = process.env.SSL_CERT_PATH;
  if (!keyPath || !certPath) {
    throw new Error("Missing SSL_KEY_PATH or SSL_CERT_PATH");
  }

  const key = fs.readFileSync(resolveCertPath(keyPath));
  const cert = fs.readFileSync(resolveCertPath(certPath));

  https.createServer({ key, cert }, app).listen(PORT, () => {
    console.log(`🚀 Server running on https://localhost:${PORT}`);
  });
}

main();
