jest.mock("../src/services/ai/localEmbedding.provider", () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.1, 0.1]),
  getEmbeddingModelName: () => "test-model",
}));

import request from "supertest";
import app from "../src/app";
import { registerUser } from "./helpers";

describe("Comments API", () => {
  it("adds and lists comments", async () => {
    const { token } = await registerUser("commenter");

    const postRes = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("text", "Post for comments")
      .expect(201);

    const postId = postRes.body.id as string;

    const commentRes = await request(app)
      .post(`/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "Nice post" })
      .expect(201);

    expect(commentRes.body.text).toBe("Nice post");

    const listRes = await request(app)
      .get(`/posts/${postId}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(listRes.body.items.length).toBe(1);
  });

  it("returns 404 when post does not exist", async () => {
    const { token } = await registerUser("comment_404");
    await request(app)
      .post("/posts/507f1f77bcf86cd799439011/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({ text: "orphan" })
      .expect(404);
  });
});
