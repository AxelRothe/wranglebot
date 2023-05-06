import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";
import { SocketServer } from "../../SocketServer";
import { WrangleBot } from "../../../core/WrangleBot";

export default {
  method: "post",
  requiredParams: ["username"],
  public: true,
  url: "/users/:username/reset-password",
  handler: async (req, res, bot: WrangleBot, socketServer: SocketServer) => {
    const { username } = req.params;

    const user = await bot.query.users.one({ id: username }).fetch();
    if (!user) {
      return new RouteResult(404, LogBot.resolveErrorCode(404));
    }

    const password = await bot.accountManager.resetPassword(user);

    try {
      await socketServer.sendMail({
        from: {
          fullName: "WrangleBot",
        },
        to: user,
        subject: "Password Reset",
        body: `Your password has been reset to <code>${password}</code>. Please download your client at <a href="https://wranglebot.io">wranglebot.io</a> to get started.<br><br>`,
        button: {
          text: "Download Client Here",
          link: "https://wranglebot.io/download",
        },
      });
    } catch (e) {
      LogBot.log(500, "Unable to send email");
    }

    return new RouteResult(200, { success: true });
  },
};
