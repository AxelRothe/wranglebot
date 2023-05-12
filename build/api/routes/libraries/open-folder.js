"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logbotjs_1 = __importDefault(require("logbotjs"));
const RouteResult_1 = __importDefault(require("../../RouteResult"));
exports.default = {
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
                logbotjs_1.default.log(200, `Showing metafile ${copy.metaFile.name} in finder`);
                return new RouteResult_1.default(200, {
                    message: `Showing metafile ${copy.metaFile.name} in finder`,
                });
            });
        }
    }),
};
//# sourceMappingURL=open-folder.js.map