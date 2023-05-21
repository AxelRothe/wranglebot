import LogBot from "logbotjs";
import User from "../../../core/accounts/User.js";
import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";

export default {
  method: "post",
  url: "/users",
  requiredBody: ["username", "password", "roles", "libraries"],
  requiredRole: ["admin", "maintainer"],
  handler: async (req, res, bot: WrangleBot, socketServer: SocketServer) => {
    const { username, password, roles, libraries, firstName, lastName, email } = req.body;

    const user = await bot.query.users.post({
      username,
      password,
      firstName,
      lastName,
      email,
      roles,
      libraries,
    });

    if (user) {
      const thisUser: User = socketServer.getUser(req, res);

      await socketServer.sendMail({
        from: thisUser,
        to: user,
        subject: "Welcome to WrangleBot",
        body: `You have been added to the WrangleBot system. Please download your client at <a href="https://wranglebot.io">wranglebot.io</a> to get started.<br><br>
              Your username is <b>${user.username}</b> and your initial password is <b>${password}</b>.<br><br>
              Please change your password as soon as possible, by clicking on your username in the top right corner in the client and selecting "User Account".<br><br>
              If you have any questions, please contact me at <a href="mailto:${thisUser.email}">${thisUser.email}</a>.<br><br>
              Thanks,<br>
              ${thisUser.fullName}`,
        button: {
          text: "Download Client Here",
          link: "https://wranglebot.io",
        },
      });

      return new RouteResult(200, user.toJSON({ db: false }));
    } else {
      throw new Error("User could not be created");
    }
  },
};
