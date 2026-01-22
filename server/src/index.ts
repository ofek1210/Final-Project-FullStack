import "dotenv/config";
import https from "node:https";
import fs from "node:fs";
import app from "./app";
import { connectDB } from "./config/db";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";


const PORT = Number(process.env.PORT);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
    },
    servers: [{ url: "https://localhost:3000" }],
  },
  // הכי חשוב: נתיב מוחלט, לא יחסי
  apis: [path.resolve(process.cwd(), "src/**/*.ts")],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions as any);

console.log("Swagger scanning:", swaggerOptions.apis);
console.log("Swagger paths found:", Object.keys(swaggerSpec.paths || {}).length);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

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
