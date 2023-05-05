import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";

export default {
  method: "put",
  requiredParams: ["username"],
  url: "/users/:username",
  handler: async (req, res, wrangleBot, socketServer) => {
    const { username } = req.params;
    if (!socketServer.isUser(req, res, username) && !socketServer.checkRequestAuthorization(req, res, ["admin", "maintainer"])) return;

    const user = await wrangleBot.query.users.one({ id: username }).fetch();
    if (!user) {
      res.status(404).send({ error: LogBot.resolveErrorCode(404) });
      return;
    }

    if (req.body.password) await wrangleBot.accountManager.changePassword(user, req.body.password);

    user.query.put({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      roles: req.body.roles,
      libraries: req.body.libraries,
      config: req.body.config,
    });

    return new RouteResult(200, user.toJSON({ security: true }));
  },
};
