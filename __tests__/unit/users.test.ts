// import request from "supertest";
// import app from "../../src/app";
// import mongoose from "mongoose";
// import { User } from "#models/User";
// import { Activation } from "#models/Activation";
// import { RefreshToken } from "#models/RefreshToken";

// describe("Getting Users", () => {
//   test("get all users", async () => {
//     const user = await User.findOne({ email: "jdoe@email.com" });
//     expect(user).not.toBeNull();
//     expect(user!.email).toEqual("jdoe@email.com");
//     expect(user!.emailVerified).toEqual(false);

//     const activation = await Activation.findOne({ user: user!._id });
//     expect(activation).not.toBeNull();
//   });

//   test("Verification required before login", async () => {
//     const res = await request(app).post("/login").send({
//       email: "jdoe@email.com",
//       password: "password",
//     });
//     expect(res.status).toBe(401);
//     expect("error" in res.body).toEqual(true);
//     expect(res.body.error).toEqual("Email not verified");
//   });
// });

// afterAll(async () => {
//   await mongoose.connection.close();
//   const user = await User.findOne({ email: "jdoe@email.com" });
//   await RefreshToken.deleteOne({ user: user!._id });
//   await Activation.deleteOne({ user: user!._id });
//   await user!.deleteOne();
// }, 1000);
