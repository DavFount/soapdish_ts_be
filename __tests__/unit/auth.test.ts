import request from "supertest";
import app from "../../src/app";
import mongoose from "mongoose";
import { User } from "#models/User";
import { Activation } from "#models/Activation";
import { RefreshToken } from "#models/RefreshToken";

describe("Test Registration", () => {
  test("Register user without required information", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        email: "jdoe@email.com",
        password: "password",
        details: {
          firstName: "John",
        },
      });

    expect(res.status).toBe(400);
    expect("errors" in res.body).toEqual(true);
    expect("details.lastName" in res.body.errors).toEqual(true);
  });

  test("Register user with required information", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        email: "jdoe@email.com",
        password: "password",
        details: {
          firstName: "John",
          lastName: "Doe",
        },
      });

    expect(res.status).toBe(201);
    expect("message" in res.body).toEqual(true);
    expect(res.body.message).toEqual("User created successfully!");
  });
});

describe("Test Email Verification is Required", () => {
  test("Verification Record Present", async () => {
    const user = await User.findOne({ email: "jdoe@email.com" });
    expect(user).not.toBeNull();
    expect(user!.email).toEqual("jdoe@email.com");
    expect(user!.emailVerified).toEqual(false);

    const activation = await Activation.findOne({ user: user!._id });
    expect(activation).not.toBeNull();
  });

  test("Verification required before login", async () => {
    const res = await request(app).post("/login").send({
      email: "jdoe@email.com",
      password: "password",
    });
    expect(res.status).toBe(401);
    expect("error" in res.body).toEqual(true);
    expect(res.body.error).toEqual("Email not verified");
  });
});

describe("Test verify user endpoint", () => {
  test("Verify User", async () => {
    const user = await User.findOne({ email: "jdoe@email.com" });
    const activation = await Activation.findOne({ user: user!._id });
    const res = await request(app).get("/verify").query({
      token: activation!.verificationToken,
    });
    expect(res.status).toBe(200);
    expect("message" in res.body).toEqual(true);
    expect(res.body.message).toEqual("Email verified successfully!");
  });

  test("Verify User - Invalid Token", async () => {
    const res = await request(app).get("/verify").query({
      token: "0b8418328120f35df6e1d8946347cf0f429dde1bf70e8f2c59eb370160a77c4c",
    });
    expect(res.status).toBe(404);
    expect("error" in res.body).toEqual(true);
    expect(res.body.error).toEqual("Invalid Token");
  });
});

describe("Test login after verification", () => {
  test("Login Validation - (user not found)", async () => {
    const res = await request(app).post("/login").send({
      email: "wrongemail@email.com",
      password: "password",
    });
    expect(res.status).toBe(401);
    expect("error" in res.body).toEqual(true);
    expect(res.body.error).toEqual("Invalid Username/Password");
  });

  test("Login Validation - (invlaid password)", async () => {
    const res = await request(app).post("/login").send({
      email: "jdoe@email.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
    expect("error" in res.body).toEqual(true);
    expect(res.body.error).toEqual("Invalid Username/Password");
  });

  test("Login Validation - Should Pass", async () => {
    const res = await request(app).post("/login").send({
      email: "jdoe@email.com",
      password: "password",
    });
    expect(res.status).toBe(200);
    expect("accessToken" in res.body).toEqual(true);
    expect("refreshToken" in res.body).toEqual(true);
    expect("user" in res.body).toEqual(true);
    expect(res.body.user.email).toEqual("jdoe@email.com");

    const refreshToken = await RefreshToken.findOne({
      user: res.body.user._id,
    });
    expect(refreshToken).not.toBeNull();
  });
});

describe("Test logout", () => {
  test("Logout - (no token)", async () => {
    const res = await request(app).delete("/logout");
    expect(res.status).toBe(401);
    expect("error" in res.body).toEqual(true);
    expect(res.body.error).toEqual("No token, Authorization Denied");
  });

  test("Logout - (invalid token)", async () => {
    const res = await request(app).delete("/logout").set({
      "x-auth-token":
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1MDY5ZDBmNzI4MTJjM2NmMjFkZmU1YiIsImlhdCI6MTY5NTAyNDY2NCwiZXhwIjoxNjk1MDI0NzI0fQ.HSBDs4PBkbYbKld2ve3BL0K531E-psCYJ5wzN7lYzno",
    });
    expect(res.status).toBe(401);
    expect("error" in res.body).toEqual(true);
    expect(res.body.error).toEqual("Token is not valid");
  });

  test("Logout - Should Pass", async () => {
    const loginRes = await request(app).post("/login").send({
      email: "jdoe@email.com",
      password: "password",
    });

    const res = await request(app)
      .delete("/logout")
      .send({
        email: "jdoe@email.com",
      })
      .set({
        "x-auth-token": loginRes.body.accessToken,
      });

    expect(res.status).toBe(200);
    expect("message" in res.body).toEqual(true);
    expect(res.body.message).toEqual("Log out successful");

    const refreshToken = await RefreshToken.findOne({
      user: loginRes.body.user._id,
    });
    expect(refreshToken).toBeNull();
  });
});

describe("Test refresh token", () => {
  test("Refresh Token - (no token)", async () => {
    const res = await request(app).post("/refresh");
    expect(res.status).toBe(404);
    expect("error" in res.body).toEqual(true);
    expect(res.body.error).toEqual("Invalid Refresh Token");
  });

  test("Refresh Token - (valid token)", async () => {
    const loginRes = await request(app).post("/login").send({
      email: "jdoe@email.com",
      password: "password",
    });

    const res = await request(app).post("/refresh").send({
      refreshToken: loginRes.body.refreshToken,
    });
    expect(res.status).toBe(200);
    expect("accessToken" in res.body).toEqual(true);
  });

  test("Refresh Token - (expired token)", async () => {
    const user = await User.findOne({ email: "jdoe@email.com" });
    const refreshToken = await RefreshToken.findOne({ user: user!._id });
    refreshToken!.expiresAt = new Date();
    refreshToken!.save();

    const res = await request(app).post("/refresh").send({
      refreshToken: refreshToken!.refreshToken,
    });
    expect(res.status).toBe(404);
    expect("error" in res.body).toEqual(true);
    expect(res.body.error).toEqual("Refresh Token Expired");
  });
});

// TODO: Test resend verification email
// TODO: Test reset password

afterAll(async () => {
  await mongoose.connection.close();
  const user = await User.findOne({ email: "jdoe@email.com" });
  await RefreshToken.deleteOne({ user: user!._id });
  await Activation.deleteOne({ user: user!._id });
  await user?.deleteOne();
}, 1000);
