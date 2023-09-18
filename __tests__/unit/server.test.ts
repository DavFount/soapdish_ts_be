import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";

describe("Test index.ts", () => {
  test("Catch-all route", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toEqual("Welcome to the SOAP Dish API!");
  });
});

afterAll(() => {
  mongoose.connection.close();
}, 1000);
