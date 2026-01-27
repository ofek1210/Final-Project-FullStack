import mongoose from "mongoose";

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
  process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "test_refresh_secret";
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
  process.env.REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";

  const uri = process.env.MONGO_URI_TEST || "mongodb://localhost:27017/final_project_test";
  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
