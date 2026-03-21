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

  it("rejects duplicate username on register", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "dupuser", password: "password123" })
      .expect(201);

    await request(app)
      .post("/auth/register")
      .send({ username: "dupuser", password: "password123" })
      .expect(409);
  });

  it("rejects short password and bad login", async () => {
    await request(app)
      .post("/auth/register")
      .send({ username: "shortpw", password: "12345" })
      .expect(400);

    await request(app)
      .post("/auth/login")
      .send({ username: "nope", password: "password123" })
      .expect(401);

    await request(app).post("/auth/login").send({ username: "alice" }).expect(400);
  });

  it("requires refreshToken for refresh and logout", async () => {
    await request(app).post("/auth/refresh").send({}).expect(400);
    await request(app).post("/auth/logout").send({}).expect(400);
  });

  it("logs in with Google when token exchange succeeds", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sub: "google-oauth-99",
        email: "guser@example.com",
        name: "Google User",
        picture: "https://example.com/p.png",
      }),
    }) as typeof fetch;

    try {
      const res = await request(app)
        .post("/auth/google")
        .send({ accessToken: "fake-google-access" })
        .expect(200);

      expect(res.body.token).toBeTruthy();
      expect(res.body.refreshToken).toBeTruthy();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("returns 401 when Google profile fetch fails", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    }) as typeof fetch;

    try {
      await request(app).post("/auth/google").send({ accessToken: "bad" }).expect(401);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
