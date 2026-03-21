import request from "supertest";
import app from "../src/app";
import { registerUser } from "./helpers";

describe("Requests API", () => {
  it("lists empty requests publicly", async () => {
    const res = await request(app).get("/requests").expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("creates, reads, updates, and deletes a request", async () => {
    const { token } = await registerUser("req_owner");

    const createRes = await request(app)
      .post("/requests")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Need help", description: "Details here" })
      .expect(201);

    expect(createRes.body.title).toBe("Need help");

    const id = createRes.body._id as string;

    const listRes = await request(app).get("/requests").expect(200);
    expect(listRes.body.some((r: { _id: string }) => r._id === id)).toBe(true);

    const getRes = await request(app).get(`/requests/${id}`).expect(200);
    expect(getRes.body.title).toBe("Need help");

    const putRes = await request(app)
      .put(`/requests/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated title", description: "New desc", status: "open" })
      .expect(200);

    expect(putRes.body.title).toBe("Updated title");

    await request(app).delete(`/requests/${id}`).set("Authorization", `Bearer ${token}`).expect(204);

    await request(app).get(`/requests/${id}`).expect(404);
  });

  it("returns 404 for unknown id", async () => {
    await request(app).get("/requests/507f1f77bcf86cd799439011").expect(404);
  });

  it("forbids update/delete by non-owner", async () => {
    const { token: ownerToken } = await registerUser("req_creator");
    const { token: otherToken } = await registerUser("req_other");

    const createRes = await request(app)
      .post("/requests")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "Private" })
      .expect(201);

    const id = createRes.body._id as string;

    await request(app)
      .put(`/requests/${id}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Hacked" })
      .expect(403);

    await request(app).delete(`/requests/${id}`).set("Authorization", `Bearer ${otherToken}`).expect(403);
  });

  it("requires auth for create", async () => {
    await request(app).post("/requests").send({ title: "x" }).expect(401);
  });
});
