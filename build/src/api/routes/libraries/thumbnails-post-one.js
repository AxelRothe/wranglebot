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
const RouteResult_1 = __importDefault(require("../../RouteResult"));
exports.default = {
    method: "post",
    url: "/library/:id/metafiles/:file/thumbnails",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const { id, file, grab } = req.params;
        const cb = (data) => {
            server.inform("thumbnails", file, data);
        };
        const metaFile = yield bot.query.library.one(id).metafiles.one(file).fetch();
        if (metaFile.thumbnails.length === 0) {
            bot
                .generateThumbnails(id, [metaFile], cb)
                .then(() => {
                server.inform("thumbnails", file, { status: "done" });
            })
                .catch((e) => {
                console.error(e);
                server.inform("thumbnails", file, { error: e.message });
            });
            return new RouteResult_1.default(200, { success: true, message: "thumbnails are being generated." });
        }
        else {
            return new RouteResult_1.default(200, { success: true, message: "thumbnails already exist." });
        }
    }),
};
//# sourceMappingURL=thumbnails-post-one.js.map