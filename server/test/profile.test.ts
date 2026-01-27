import request from "supertest";
import app from "../src/app";

async function registerUser(username: string) {
  const res = await request(app)
    .post("/auth/register")
    .send({ username, password: "password123" })
    .expect(201);
  return res.body as { token: string };
}

describe("Profile API", () => {
  it("updates username and avatar", async () => {
    const { token } = await registerUser("profileuser");

    const updateRes = await request(app)
      .put("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ username: "profileuser2" })
      .expect(200);

    expect(updateRes.body.user.username).toBe("profileuser2");

    const avatarBuffer = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const avatarRes = await request(app)
      .patch("/users/me")
      .set("Authorization", `Bearer ${token}`)
      .attach("avatar", avatarBuffer, "avatar.png")
      .expect(200);

    expect(avatarRes.body.user.avatarUrl).toContain("/uploads/avatars/");
  });
});
