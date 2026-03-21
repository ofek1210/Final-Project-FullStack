import request from "supertest";
import app from "../src/app";

export async function registerUser(username: string, password = "password123") {
  const res = await request(app)
    .post("/auth/register")
    .send({ username, password })
    .expect(201);
  return res.body as { token: string; refreshToken: string };
}
