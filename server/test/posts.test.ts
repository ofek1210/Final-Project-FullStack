jest.mock("../src/services/ai/localEmbedding.provider", () => ({
  generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.1, 0.1]),
  getEmbeddingModelName: () => "test-model",
}));

import request from "supertest";
import app from "../src/app";
import { registerUser } from "./helpers";

describe("Posts API", () => {
  it("rejects unauthenticated list", async () => {
    await request(app).get("/posts").expect(401);
  });

  it("creates, lists, updates, and deletes posts", async () => {
    const { token } = await registerUser("poster1");

    const createRes = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .field("text", "Hello world")
      .expect(201);

    expect(createRes.body.text).toBe("Hello world");

    const listRes = await request(app)
      .get("/posts")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(listRes.body.items.length).toBe(1);

    const postId = createRes.body.id as string;

    const getRes = await request(app)
      .get(`/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(getRes.body.text).toBe("Hello world");

    const mineRes = await request(app)
      .get("/posts/mine")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(mineRes.body.items.length).toBe(1);
    expect(mineRes.body.items[0].id).toBe(postId);

    const updateRes = await request(app)
      .put(`/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .field("text", "Updated post")
      .expect(200);

    expect(updateRes.body.text).toBe("Updated post");

    await request(app)
      .delete(`/posts/${postId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
  });
});
