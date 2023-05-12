import LogBot from "logbotjs";
import RouteResult from "../../RouteResult";

export default {
  method: "post",
  url: "/social/metafile",
  handler: async (req, res, bot, server) => {
    const requestingUser = server.getUser(req, res);
    if (!requestingUser) return;

    const { library, metafile, metacopy, username } = req.body;

    const user = await bot.getOneUser(username);
    if (!user) {
      return new RouteResult(404, "User Not Found");
    }

    const shareUrl = "wranglebot://open/" + library + "/" + metafile + "/" + metacopy;

    const file = await bot.query.libraries(library).metafiles.one(metafile).fetch();
    if (!file) {
      return new RouteResult(404, "MetaFile Not Found");
    }

    const thumbnailData = await file.query.thumbnails.center.fetch();

    await server.sendMail({
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
  },
};
