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
    url: "/social/metafile",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const requestingUser = server.getUser(req, res);
        if (!requestingUser)
            return;
        const { library, metafile, metacopy, username } = req.body;
        const user = yield bot.getOneUser(username);
        if (!user) {
            return new RouteResult(404, "User Not Found");
        }
        const shareUrl = "wranglebot://open/" + library + "/" + metafile + "/" + metacopy;
        const file = yield bot.query.libraries(library).metafiles.one(metafile).fetch();
        if (!file) {
            return new RouteResult(404, "MetaFile Not Found");
        }
        const thumbnailData = yield file.query.thumbnails.center.fetch();
        yield server.sendMail({
            from: "WrangleBot <noreply@vanrothe.com>",
            to: user.email,
            subject: `${requestingUser.firstName} shared a Metafile with you`,
            text: `${requestingUser.firstName} shared this file with you: ${shareUrl}`,
            html: `<p>Hello ${user.firstName},</p>
             <p>${requestingUser.firstName} ${requestingUser.lastName} has shared a Metafile with you <a href="${shareUrl}">${file.basename}</a>
             <p>You are receiving this E-Mail as you are a registered user of a WrangleBot instance.</p>`,
        });
        return new RouteResult(200, {
            success: true,
        });
    }),
};
//# sourceMappingURL=share-mail.js.map