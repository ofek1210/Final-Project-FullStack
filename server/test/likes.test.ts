jest.mock("../src/services/ai/localEmbedding.provider", () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.1, 0.1]),
  getEmbeddingModelName: () => "test-model",
}));

import request from "supertest";
import app from "../src/app";

async function registerUser(username: string) {
  const res = await request(app)
    .post("/auth/register")
    .send({ username, password: "password123" })
    .expect(201);
  return res.body as { token: string };
}

describe("Likes API", () => {
  it("likes and unlikes a post", async () => {
    const { token } = await registerUser("liker");

    const postRes = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("text", "Post for likes")
      .expect(201);

    const postId = postRes.body.id as string;

    const likeRes = await request(app)
      .post(`/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(likeRes.body.likesCount).toBe(1);
    expect(likeRes.body.likedByMe).toBe(true);

    const unlikeRes = await request(app)
      .delete(`/posts/${postId}/like`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(unlikeRes.body.likesCount).toBe(0);
    expect(unlikeRes.body.likedByMe).toBe(false);
  });
});
