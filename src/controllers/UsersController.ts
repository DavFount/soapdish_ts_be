import { Request, Response } from "express";
import { User } from "#models/User";

export class UsersController {
  getUsers = async (req: Request, res: Response) => {
    const nPerPage: number = typeof req.query.perPage !== "undefined" ? Number(req.query.perPage) : 5;
    const lastId = req.query.lastId;

    let users = null;
    if (typeof lastId !== "string" || !lastId) {
      users = await User.find({}, { password: 0, __v: 0 }).sort({ _id: -1 }).limit(nPerPage);
    } else {
      users = await User.find({ _id: { $lt: lastId } }, { password: 0, __v: 0 })
        .sort({ _id: -1 })
        .limit(nPerPage);
    }

    res.json(users);
  };

  getUser = async (req: Request, res: Response) => {
    try {
      const user = await User.find({ _id: req.params.id }, { password: 0, __v: 0 });
      res.json(user);
    } catch (err: any) {
      res.status(404).json({
        errors: {
          message: ["User not found!"],
        },
      });
    }
  };

  createUser = async (req: Request, res: Response) => {
    const userValidation = User.createValidator(req.body);
    if (userValidation.fails()) {
      res.status(400).json({
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
        },
      });
      await user.save();
      res.status(201).json(user);
    } catch (err: any) {
      if (err.code == 11000) {
        res.status(409).json({
          errors: {
            email: ["Email already exists!"],
          },
        });
      }
    }
  };

  updateUser = async (req: Request, res: Response) => {
    try {
      const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true });
      res.status(201).json(user);
    } catch (err: any) {
      if (err.code == 11000) {
        res.status(409).json({
          errors: {
            email: ["Email already exists!"],
          },
        });
      }
      if (err.errors) {
        res.status(400).json({
          errors: err.errors,
        });
      }
    }
  };

  deleteUser = async (req: Request, res: Response) => {
    try {
      await User.deleteOne({ _id: req.params.id });
      res.status(204).json();
    } catch (err: any) {
      res.status(404).json({
        errors: {
          message: ["User not found!"],
        },
      });
    }
  };
}
