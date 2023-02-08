import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";

export default {
  method: "put",
  requiredParams: ['username'],
  url: "/users/:username",
  handler: async (req, res, wrangleBot, socketServer) => {
    const { username } = req.params;
    if (!socketServer.isUser(req, res, username) && !socketServer.checkRequestAuthorization(req, res, "admin")) return;

    const user = await wrangleBot.query.users.one({ id: username }).fetch();
    if (!user) {
      res.status(404).send({ error: LogBot.resolveErrorCode(404) });
      return;
    }

    if (req.body.password) await wrangleBot.accountManager.changePassword(user, req.body.password);
    if (req.body.firstName) {
      await wrangleBot.accountManager.changeFirstName(user, req.body.firstName);
    }
    if (req.body.lastName) {
      await wrangleBot.accountManager.changeLastName(user, req.body.lastName);
    }
    if (req.body.email) {
      await wrangleBot.accountManager.changeEmail(user, req.body.email);
    }

    if (req.body.roles) {
      for (let role of req.body.roles) {
        wrangleBot.accountManager.addRole(user, role);
      }
    }

    return new RouteResult(200, user.toJSON({ security: true }));
  }
}
