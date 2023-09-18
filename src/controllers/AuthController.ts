import { Request, Response } from "express";
import { User, IUser } from "#models/User";
import { Activation } from "#models/Activation";
import { RefreshToken } from "#models/RefreshToken";
import { Document, Types } from "mongoose";
import { SendMail } from "#services/mailer";
import { config } from "#configs/index";
import { v4 as uuidv4 } from "uuid";
import SHA256 from "crypto-js/sha256";
import { MailDataRequired } from "@sendgrid/mail";

// TODO: Add tests for all methods
// TODO: Add method to reset password
export class AuthController {
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });

      // User Deoesn't Exist
      if (!user || typeof user === "undefined") {
        return res.status(401).json({ error: "Invalid Username/Password" });
      }

      if (!user!.emailVerified) {
        return res.status(401).json({ error: "Email not verified" });
      }

      // User Exists but Password is Invalid
      const validPassword: boolean = user!.validPassword(password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid Username/Password" });
      }

      let refreshToken = await RefreshToken.findOne({ user: user!._id });

      if (!refreshToken) {
        let token = RefreshToken.generateRefreshToken().toString();
        const date = new Date();
        refreshToken = new RefreshToken({ user: user!._id, refreshToken: token, expiresAt: date.setDate(date.getDate() + 30) });
        refreshToken.save();
      }

      return res.status(200).json({
        accessToken: user!.generateAccessToken(),
        refreshToken: refreshToken.refreshToken,
        user: await User.findOne({ email: email }, { password: 0, __v: 0 }),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const user: Document<IUser> | null = await User.findOne({ email: req.body.email });

      if (!user || typeof user === "undefined") {
        return res.status(404).json({ error: "User Not Found" });
      }

      await RefreshToken.deleteOne({ user: user!._id });
      return res.status(200).json({ message: "Log out successful" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const userValidation = User.createValidator(req.body);
      if (userValidation.fails()) {
        return res.status(400).json({
          errors: userValidation.errors.all(),
        });
      }

      const user = new User({
        email: req.body.email,
        password: User.generateHash(req.body.password),
        details: {
          firstName: req.body.details.firstName,
          lastName: req.body.details.lastName,
        },
      });
      await user.save();

      const activationToken = await this._createActivationToken(user._id);
      const url = `${config.app.url}/verify?token=${activationToken}`;
      const msg: MailDataRequired = {
        to: req.body.email,
        from: config.email.user,
        subject: "[Email Verification] Welcome to The SOAP Dish",
        dynamicTemplateData: {
          c2a_link: url,
          c2a_button: "Verify Email",
        },
        templateId: "d-593ccf0a20d74091a82931fe31689c3a",
      };
      SendMail(msg);

      return res.status(201).json({
        message: "User created successfully!",
      });
    } catch (err: any) {
      if (err.code == 11000) {
        return res.status(409).json({
          errors: {
            email: ["Email already exists!"],
          },
        });
      }
    }
  };

  verify = async (req: Request, res: Response) => {
    try {
      const activation = await Activation.findOne({ verificationToken: req.query.token });

      if (!activation) {
        return res.status(404).json({ error: "Invalid Token" });
      }

      if (activation.expiresAt < new Date()) {
        await activation.deleteOne();
        return res.status(404).json({ error: "Token Expired" });
      }

      const user = await User.findOne({ _id: activation!.user }, { password: 0, __v: 0 });
      if (!user) {
        return res.status(404).json({ error: "User Not Found" });
      }

      user!.emailVerified = true;
      await user!.save();
      await activation!.deleteOne();
      return res.status(200).json({
        message: "Email verified successfully!",
      });
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  resendVerificationEmail = async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({ error: "User Not Found" });
      }

      if (user.emailVerified) {
        return res.status(404).json({ error: "Email Already Verified" });
      }

      const activation = await Activation.findOne({ user: user._id });
      if (activation) {
        await activation.deleteOne();
      }

      const activationToken = await this._createActivationToken(user._id);
      const url = `${config.app.url}/verify?token=${activationToken}`;
      const msg: MailDataRequired = {
        to: req.body.email,
        from: config.email.user,
        subject: "[Email Verification] Welcome to The SOAP Dish",
        dynamicTemplateData: {
          c2a_link: url,
          c2a_button: "Verify Email",
        },
        templateId: "d-593ccf0a20d74091a82931fe31689c3a",
      };
      SendMail(msg);

      return res.status(200).json({
        message: "Verification email sent successfully!",
      });
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  refresh = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const refresh = await RefreshToken.findOne({ refreshToken: refreshToken });
      if (!refresh) {
        return res.status(404).json({ error: "Invalid Refresh Token" });
      }

      if (refresh.expiresAt < new Date()) {
        await refresh.deleteOne();
        return res.status(404).json({ error: "Refresh Token Expired" });
      }

      const user = await User.findOne({ _id: refresh!.user }, { password: 0, __v: 0 });
      if (!user) {
        return res.status(404).json({ error: "User Not Found" });
      }

      return res.status(200).json({
        accessToken: user!.generateAccessToken(),
      });
    } catch (err) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  _createActivationToken = async (user: Types.ObjectId) => {
    const uuid = uuidv4();
    const verificationToken = SHA256(uuid).toString();
    const date = new Date();

    const activation = new Activation({
      user: user,
      verificationToken: verificationToken,
      expiresAt: date.setDate(date.getDate() + 2),
    });

    await activation.save();
    return verificationToken;
  };
}
