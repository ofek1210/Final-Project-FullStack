"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("./config/db");
const app_1 = __importDefault(require("./app"));
const PORT = Number(process.env.PORT) || 3001;
async function main() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri)
        throw new Error("Missing MONGO_URI in .env");
    await (0, db_1.connectDB)(mongoUri);
    app_1.default.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
