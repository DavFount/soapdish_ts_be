import request from "supertest";
import app from "../../src/app";

describe("Test index.ts", () => {
  test("Catch-all route", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual("Welcome to the SOAP Dish API!");
  });
});
