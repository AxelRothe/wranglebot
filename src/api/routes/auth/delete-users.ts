import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";

export default {
  method: "delete",
  requiredRole: ["admin", "maintainer"],
  url: "/users/:username",
  handler: async (req, res, bot, socketServer) => {
    const { username } = req.params;

    const user = bot.accountManager.getOneUser(username);
    if (!user) {
      res.status(404).send({
        error: LogBot.resolveErrorCode(404),
      });
      return;
    }

    const r = bot.accountManager.removeOneUser(user);

    if (r) {
      LogBot.log(200, `DELETE /users/${username}`);
      return new RouteResult(200, "user deleted");
    } else {
      throw new Error("User could not be deleted");
    }
  },
};
