var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import LogBot from "logbotjs";
import RouteResult from "../../RouteResult.js";
export default {
    method: "post",
    url: "/library/:library/metafiles/:metafile/metacopies/:metaCopy/show",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { library, metafile, metaCopy } = req.params;
        const copy = yield bot.query.library.one(library).metafiles.one(metafile).metacopies.one(metaCopy).fetch();
        if (bot.finder.isReachable(copy.pathToBucket.folder)) {
            bot.finder.openInFinder(copy.pathToBucket.folder, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                LogBot.log(200, `Showing metafile ${copy.metaFile.name} in finder`);
                return new RouteResult(200, {
                    message: `Showing metafile ${copy.metaFile.name} in finder`,
                });
            });
        }
    }),
};
//# sourceMappingURL=open-folder.js.map