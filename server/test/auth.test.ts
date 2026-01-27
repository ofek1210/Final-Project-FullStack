import request from "supertest";
import app from "../src/app";

describe("Auth API", () => {
  it("registers, logs in, refreshes, and logs out", async () => {
    const registerRes = await request(app)
      .post("/auth/register")
      .send({ username: "alice", password: "password123" })
      .expect(201);

    expect(registerRes.body.token).toBeTruthy();
    expect(registerRes.body.refreshToken).toBeTruthy();

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ username: "alice", password: "password123" })
      .expect(200);

    expect(loginRes.body.token).toBeTruthy();
    expect(loginRes.body.refreshToken).toBeTruthy();

    const refreshRes = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: loginRes.body.refreshToken })
      .expect(200);

    expect(refreshRes.body.token).toBeTruthy();
    expect(refreshRes.body.refreshToken).toBeTruthy();

    await request(app)
      .post("/auth/logout")
      .send({ refreshToken: refreshRes.body.refreshToken })
      .expect(204);

    await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: refreshRes.body.refreshToken })
      .expect(403);
  });
});
