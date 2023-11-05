import { Router } from "express";
import { TeamsController } from "#controllers/TeamsController";
import { verifyToken } from "#middleware/auth";
import { isTeamAdmin, isTeamOwner } from "#middleware/guard";

export const teamRoutes = Router();
const teamsController = new TeamsController();

// Team Management
teamRoutes.get("/teams", verifyToken, teamsController.getTeams);

teamRoutes.post("/teams", verifyToken, teamsController.createTeam);

teamRoutes.put("/teams/:id", verifyToken, isTeamOwner, teamsController.updateTeam);

teamRoutes.delete("/teams/:id", verifyToken, isTeamOwner, teamsController.deleteTeam);

// Team Members Management
teamRoutes.post("/teams/:id/members", verifyToken, isTeamAdmin, teamsController.addMember);

teamRoutes.put("/teams/:id/members/:memberId", verifyToken, isTeamAdmin, teamsController.updateMember);

teamRoutes.delete("/teams/:id/members/:memberId", verifyToken, isTeamAdmin, teamsController.removeMember);

teamRoutes.get("/team/join", teamsController.acceptInvite);
