import { Response } from "express";
import { Request } from "express-jwt";
import { User } from "#models/User";
import { Types } from "mongoose";
import { SendMail } from "#services/mailer";
import { config } from "#configs/index";
import jwt, { JwtPayload } from "jsonwebtoken";
import { MailDataRequired } from "@sendgrid/mail";
import { SoapError } from "#utils/errors.util";

export class AuthController {
  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });

      if (!user || typeof user === "undefined") {
        throw new SoapError({
          name: "INVALID_USERNAME_PASSWORD",
          message: "Invalid Username/Password",
          status: 401,
        });
      }

      const validPassword: boolean = user!.validPassword(password);
      if (!validPassword) {
        throw new SoapError({
          name: "INVALID_USERNAME_PASSWORD",
          message: "Invalid Username/Password",
          status: 401,
        });
      }

      if (!user!.emailVerified) {
        throw new SoapError({
          name: "EMAIL_NOT_VERIFIED",
          message: "Email not verified",
          status: 401,
        });
      }

      return res.status(200).json({
        accessToken: user!.generateAccessToken(),
        refreshToken: user!.generateRefreshToken(),
        user: await User.findOne({ _id: user!._id }).select({
          "id": 1,
          "email": 1,
          "details.firstName": 1,
          "details.lastName": 1,
          "teams": 1,
        }),
      });
    } catch (err) {
      if (err instanceof SoapError) {
        return res.status(err.status).json({ error: err.message });
      }
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      await User.findOneAndUpdate({ email: req.body.email }, { $set: { refreshToken: "", accessToken: "" } });
      return res.status(200).json({ message: "Log out successful" });
    } catch (err) {
      if (err instanceof SoapError) {
        return res.status(err.status).json({ error: err.message });
      }
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
        templateId: config.sendgrid.newUserTemplate,
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
      const decoded: JwtPayload = jwt.verify(req.query.token as string, config.jwt.verification_secret) as JwtPayload;

      const user = await User.findOne({ _id: decoded!.id });
      if (!user) {
        throw new SoapError({
          name: "USER_NOT_FOUND",
          message: "User Not Found",
          status: 404,
        });
      }

      if (user.emailVerified) {
        throw new SoapError({
          name: "EMAIL_ALREADY_VERIFIED",
          message: "Email Already Verified",
          status: 400,
        });
      }

      user!.emailVerified = true;
      await user!.save();
      return res.status(200).json({
        message: "Email verified successfully!",
      });
    } catch (err) {
      if (err instanceof SoapError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.status(500).json({ error: err });
    }
  };

  resendVerificationEmail = async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        throw new SoapError({
          name: "USER_NOT_FOUND",
          message: "User Not Found",
          status: 404,
        });
      }

      if (user.emailVerified) {
        throw new SoapError({
          name: "EMAIL_ALREADY_VERIFIED",
          message: "Email Already Verified",
          status: 401,
        });
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
        templateId: config.sendgrid.newUserTemplate,
      };
      SendMail(msg);

      return res.status(200).json({
        message: "Verification email sent successfully!",
      });
    } catch (err) {
      if (err instanceof SoapError) {
        return res.status(err.status).json({ error: err.message });
      }
    }
  };

  refresh = async (req: Request, res: Response) => {
    try {
      jwt.verify(req.body.refreshToken, config.jwt.refresh_secret);
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        throw new SoapError({
          name: "USER_NOT_FOUND",
          message: "User Not Found",
          status: 404,
        });
      }
      const token = user!.generateAccessToken();
      return res.status(200).json({
        accessToken: token,
      });
    } catch (err) {
      if (err instanceof SoapError) {
        return res.status(err.status).json({ error: err.message });
      }
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(403).json({ error: "Token Expired" });
      }
      return res.status(500).json({ error: "Unknown Server Error" });
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      if (!req.body.email) {
        return res.status(400).json({ error: "Email not provided" });
      }
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(200).json("ok");
      }
      const passwordResetToken = user!.generatePasswordResetToken();
      user!.resetPasswordToken = passwordResetToken;
      await user!.save();
      const url = `${config.app.url}/reset-password?token=${passwordResetToken}`;
      const msg: MailDataRequired = {
        to: req.body.email,
        from: config.email.user,
        subject: "[Password Reset] The SOAP Dish",
        dynamicTemplateData: {
          c2a_link: url,
        },
        templateId: config.sendgrid.passwordResetTemplate,
      };
      SendMail(msg);
      return res.status(200).json("ok");
    } catch (err) {
      if (err instanceof SoapError) {
        return res.status(err.status).json({ error: err.message });
      }
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      if (!req.body.password || req.body.password.length < 8) {
        return res.status(400).json({ error: "Password is required and must be at least 8 characters long" });
      }

      const decoded: JwtPayload = jwt.verify(req.body.token, config.jwt.password_reset_secret) as JwtPayload;
      const user = await User.findOne({ _id: decoded!.id });
      if (req.body.token !== user!.resetPasswordToken) {
        return res.status(400).json({ error: "Invalid Token" });
      }

      if (!user) {
        throw new SoapError({
          name: "USER_NOT_FOUND",
          message: "User Not Found",
          status: 404,
        });
      }

      user!.password = User.generateHash(req.body.password);
      user!.passwordChangeRequired = false;
      user!.resetPasswordToken = "";
      await user!.save();
      return res.status(200).json({
        message: "Password reset successfully!",
      });
    } catch (err) {
      if (err instanceof SoapError) {
        return res.status(err.status).json({ error: err.message });
      }
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(403).json({ error: "Token Expired" });
      }
      return res.status(500).json({ error: "Unknown Server Error" });
    }
  };

  _createActivationToken = async (user: Types.ObjectId) => {
    return jwt.sign({ id: user }, config.jwt.verification_secret, {
      expiresIn: config.jwt.verificationTokenExpiry,
      algorithm: "HS256",
      issuer: config.jwt.issuer,
    });
  };
}
