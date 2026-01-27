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

describe("Posts API", () => {
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
