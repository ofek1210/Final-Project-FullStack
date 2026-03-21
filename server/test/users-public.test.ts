jest.mock("../src/services/ai/localEmbedding.provider", () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.1, 0.1]),
  getEmbeddingModelName: () => "test-model",
}));

import request from "supertest";
import app from "../src/app";
import { registerUser } from "./helpers";

describe("Public user profile API", () => {
  it("returns public profile and posts by user id", async () => {
    const userA = await registerUser("public_a");
    const userB = await registerUser("public_b");

    const meRes = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${userB.token}`)
      .expect(200);
    const otherUserId = meRes.body.user.userId as string;

    const profileRes = await request(app)
      .get(`/users/profile/${otherUserId}`)
      .set("Authorization", `Bearer ${userA.token}`)
      .expect(200);

    expect(profileRes.body.user.username).toBe("public_b");
    expect(profileRes.body.user.userId).toBe(otherUserId);

    await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${userB.token}`)
      .field("text", "Post on public profile")
      .expect(201);

    const postsRes = await request(app)
      .get(`/posts/by-user/${otherUserId}`)
      .set("Authorization", `Bearer ${userA.token}`)
      .expect(200);

    expect(postsRes.body.items.length).toBe(1);
    expect(postsRes.body.items[0].text).toBe("Post on public profile");
  });

  it("returns 404 for unknown user id", async () => {
    const { token } = await registerUser("public_c");
    await request(app)
      .get("/users/profile/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  });
});
