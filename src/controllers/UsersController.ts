import { Response } from "express";
import { Request as JWTRequest } from "express-jwt";
import { User } from "#models/User";

export class UsersController {
  getUsers = async (req: JWTRequest, res: Response) => {
    const nPerPage: number = typeof req.query.perPage !== "undefined" ? Number(req.query.perPage) : 5;
    const lastId = req.query.lastId;

    let users = null;
    if (typeof lastId !== "string" || !lastId) {
      users = await User.find({}, { password: 0, __v: 0, email: 0 }).sort({ _id: -1 }).limit(nPerPage);
    } else {
      users = await User.find({ _id: { $lt: lastId } }, { password: 0, __v: 0, email: 0 })
        .sort({ _id: -1 })
        .limit(nPerPage);
    }

    return res.json(users);
  };

  getUser = async (req: JWTRequest, res: Response) => {
    try {
      const user = await User.find({ _id: req.params.id }, { password: 0, __v: 0 });
      return res.json(user);
    } catch (err: any) {
      return res.status(404).json({
        errors: {
          message: ["User not found!"],
        },
      });
    }
  };

  createUser = async (req: JWTRequest, res: Response) => {
    const userValidation = User.createValidator(req.body);
    if (userValidation.fails()) {
      return res.status(400).json({
        errors: userValidation.errors.all(),
      });
    }

    try {
      const user = new User({
        email: req.body.email,
        password: User.generateHash(req.body.password),
        details: {
          firstName: req.body.details.firstName,
          lastName: req.body.details.lastName,
          emailVerified: true,
        },
      });
      await user.save();
      return res.status(201).json(user);
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

  updateUser = async (req: JWTRequest, res: Response) => {
    try {
      const user = await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          email: req.body.email,
          details: {
            firstName: req.body.details.firstName,
            lastName: req.body.details.lastName,
            biography: req.body.details.biography,
            jobTitle: req.body.details.jobTitle,
            testimonial: req.body.details.testimonial,
            location: req.body.details.location,
            phone: req.body.details.phone,
            language: req.body.details.language,
            translation: req.body.details.translation,
            avatar: req.body.details.avatar,
          },
          socials: {
            facebook: req.body.socials.facebook,
            twitter: req.body.socials.twitter,
            instagram: req.body.socials.instagram,
            tiktok: req.body.socials.tiktok,
            linkedin: req.body.socials.linkedin,
          },
        },
        { new: true, runValidators: true }
      );
      return res.status(201).json(user);
    } catch (err: any) {
      if (err.code == 11000) {
        return res.status(409).json({
          errors: {
            email: ["Email already exists!"],
          },
        });
      }
      if (err.errors) {
        return res.status(400).json({
          errors: err.errors,
        });
      }
    }
  };

  deleteUser = async (req: JWTRequest, res: Response) => {
    try {
      await User.deleteOne({ _id: req.params.id });
      return res.status(204).json();
    } catch (err: any) {
      return res.status(404).json({
        errors: {
          message: ["User not found!"],
        },
      });
    }
  };
}
