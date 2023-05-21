var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import RouteResult from "../../RouteResult.js";
export default {
    method: "post",
    url: "/users",
    requiredBody: ["username", "password", "roles", "libraries"],
    requiredRole: ["admin", "maintainer"],
    handler: (req, res, bot, socketServer) => __awaiter(void 0, void 0, void 0, function* () {
        const { username, password, roles, libraries, firstName, lastName, email } = req.body;
        const user = yield bot.query.users.post({
            username,
            password,
            firstName,
            lastName,
            email,
            roles,
            libraries,
        });
        if (user) {
            const thisUser = socketServer.getUser(req, res);
            yield socketServer.sendMail({
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
        }
        else {
            throw new Error("User could not be created");
        }
    }),
};
//# sourceMappingURL=post-users.js.map