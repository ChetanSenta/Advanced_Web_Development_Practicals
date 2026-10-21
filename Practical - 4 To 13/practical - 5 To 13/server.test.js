import { expect, test, describe } from "@jest/globals";
import request from "supertest";
import { app } from "./server.js";

describe("Task API", () => {
  test("GET /tasks requires authentication", async () => {
    const response = await request(app).get("/tasks");

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      message: "Authentication token required.",
    });
  });
});
