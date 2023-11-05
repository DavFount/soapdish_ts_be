import { Response } from "express";
import { Request } from "express-jwt";
import { Types } from "mongoose";
import { Team, TeamRoles } from "#models/Team";
import { User } from "#models/User";
import { SoapError } from "#utils/errors.util";
import { SendMail } from "#services/mailer";
import { v4 as uuidv4 } from "uuid";
import SHA256 from "crypto-js/sha256";
import { config } from "#configs/index";
import { MailDataRequired } from "@sendgrid/mail";

export class TeamsController {
  getTeams = async (req: Request, res: Response) => {
    const user = await User.findOne({ _id: req.auth?.id });
    if (!user || typeof user === "undefined") {
      throw new SoapError({
        name: "USER_NOT_FOUND",
        message: "User Not Found",
        status: 404,
      });
    }
    const teams = await Team.find({ _id: { $in: user?.teams } });
    return res.status(200).json(teams);
  };

  createTeam = async (req: Request, res: Response) => {
    const teamValidation = Team.createValidator(req.body);
    if (teamValidation.fails()) {
      return res.status(400).json({
        errors: teamValidation.errors.all(),
      });
    }

    try {
      const user = await User.findOne({ _id: req.auth?.id });
      if (!user || typeof user === "undefined") {
        throw new SoapError({
          name: "USER_NOT_FOUND",
          message: "User Not Found",
          status: 404,
        });
      }
      const team = new Team({
        name: req.body.name,
        description: req.body.description,
        members: [{ user: user!.id, role: TeamRoles.Owner }],
      });
      await team.save();
      user.teams.push(team.id);
      await user.save();

      return res.status(201).json(team);
    } catch (err: any) {
      if (err instanceof SoapError) {
        return res.status(err.status).json({ error: err.message });
      }
      return res.status(500).json({ error: err.message });
    }
  };

  updateTeam = async (req: Request, res: Response) => {
    try {
      const team = await Team.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true });
      return res.status(201).json(team);
    } catch (err: any) {
      if (err.errors) {
        return res.status(400).json({
          errors: err.errors,
        });
      }
    }
  };

  deleteTeam = async (req: Request, res: Response) => {
    try {
      const team = await Team.findOne({ _id: req.params.id });

      team!.members!.forEach(async (member) => {
        const user = await User.findOne({ _id: member.user });
        if (user) {
          user.teams!.splice(user.teams?.indexOf(team!.id), 1);
          await user.save();
        }
      });

      await Team.deleteOne({ _id: req.params.id });
      return res.status(200).json("Team deleted successfully!");
    } catch (err: any) {
      if (err instanceof SoapError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.status(500).json({ error: err.message });
    }
  };

  addMember = async (req: Request, res: Response) => {
    try {
      if (req.body.email === undefined) {
        return res.status(400).json({ message: "Email is required!" });
      }

      const requestingUser = await User.findOne({ _id: req.auth?.id });
      const team = await Team.findOne({ _id: req.params.id });
      let user = await User.findOne({ email: req.body.email });

      if (!user) {
        const tempPassword = Math.random().toString(36).slice(-8);
        const inviteToken = await this._createActivationToken();
        const url = `${config.app.url}/team/join?invitation=${inviteToken}`;
        const owner = await User.findOne({ _id: team!.members?.find((member) => member.role === TeamRoles.Owner)?.user });
        user = new User({
          email: req.body.email,
          password: User.generateHash(tempPassword),
          details: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
          },
          passwordChangeRequired: true,
          emailVerified: true,
          teamInvites: [{ team: team!.id, token: inviteToken }],
        });
        await user.save();

        const msg: MailDataRequired = {
          to: req.body.email,
          from: config.email.user,
          subject: "[SOAP Dish] You've been invited to join a group!",
          dynamicTemplateData: {
            user_first_name: req.body.firstName,
            user_email: req.body.email,
            user_temp_password: tempPassword,
            group_name: team!.name,
            group_owner: `${owner?.details.firstName} ${owner?.details.lastName}`,
            inviting_member: `${requestingUser!.details.firstName} ${requestingUser!.details.lastName}`,
            group_description: team!.description,
            team_invite_url: url,
          },
          templateId: config.sendgrid.teamInviteNewUserTemplate,
        };
        SendMail(msg);
      } else {
        if (!user.teams.find((team) => team.equals(req.params.id))) {
          const inviteToken = await this._createActivationToken();
          const url = `${config.app.url}/team/join?invitation=${inviteToken}`;
          const owner = await User.findOne({ _id: team!.members?.find((member) => member.role === TeamRoles.Owner)?.user });
          user.teamInvites?.push({ team: team!.id, token: inviteToken });
          await user.save();
          const msg: MailDataRequired = {
            to: user!.email,
            from: config.email.user,
            subject: "[SOAP Dish] You've been invited to join a group!",
            dynamicTemplateData: {
              user_first_name: user!.details.firstName,
              group_name: team!.name,
              group_owner: `${owner?.details.firstName} ${owner?.details.lastName}`,
              inviting_member: `${requestingUser!.details.firstName} ${requestingUser!.details.lastName}`,
              group_description: team!.description,
              team_invite_url: url,
            },
            templateId: config.sendgrid.teamInviteExistingUserTemplate,
          };
          SendMail(msg);
        }
      }
      return res.status(200).json({ message: "Member invited successfully!", team: team });
    } catch (err: any) {
      if (err instanceof SoapError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.status(500).json({ error: err.message });
    }
  };

  removeMember = async (req: Request, res: Response) => {
    const team = await Team.findOne({ _id: req.params.id });
    const user = await User.findOne({ _id: req.params.memberId });
    team!.members?.splice(
      team!.members?.findIndex((member) => member.user.equals(user!._id)),
      1
    );
    await team!.save();
    user!.teams?.splice(user!.teams?.indexOf(team!.id), 1);
    await user!.save();
    return res.status(200).json({ message: "Member removed successfully!", team: team });
  };

  updateMember = async (req: Request, res: Response) => {
    try {
      const user = await User.findOne({ _id: req.params.memberId });

      if (!user) {
        throw new SoapError({
          name: "USER_NOT_FOUND",
          message: "User or Team not found!",
          status: 404,
        });
      }

      const team = await Team.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        {
          $set: {
            "members.$[x].role": req.body.role,
          },
        },
        {
          arrayFilters: [
            {
              "x.user": user._id,
            },
          ],
          new: true,
          runValidators: true,
        }
      );

      return res.status(200).json({ message: "Member updated successfully!", team: team });
    } catch (err: any) {
      if (err instanceof SoapError) {
        return res.status(err.status).json({ error: err.message });
      }

      return res.status(500).json({ error: err.message });
    }
  };

  acceptInvite = async (req: Request, res: Response) => {
    const user = await User.findOne({ teamInvites: { $elemMatch: { token: req.query.invitation } } });
    if (!user) {
      return res.status(404).json({ message: "Invite not found!" });
    }

    const team = await Team.findOne({ _id: user.teamInvites?.find((invite) => invite.token === req.query.invitation)?.team });
    if (!team) {
      return res.status(404).json({ message: "Team not found!" });
    }

    team!.members!.push({ user: user._id, role: TeamRoles.Member, status: true, joinDate: new Date() });
    await team.save();
    user.teams?.push(team.id);
    user.teamInvites?.splice(
      user.teamInvites?.findIndex((invite) => invite.token === req.query.invitation),
      1
    );
    await user.save();

    res.status(200).json("Invite accepted successfully!");
  };

  _createActivationToken = async () => {
    const uuid = uuidv4();
    const verificationToken = SHA256(uuid).toString();
    return verificationToken;
  };
}
