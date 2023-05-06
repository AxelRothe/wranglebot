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
const TranscodeTemplates_1 = __importDefault(require("../../../core/transcode/TranscodeTemplates"));
const RouteResult_1 = __importDefault(require("../../RouteResult"));
exports.default = {
    method: "get",
    requiredRole: ["admin", "maintainer", "contributor"],
    url: "/status/transcode",
    handler: (req, res, bot, server) => __awaiter(void 0, void 0, void 0, function* () {
        const availableTranscodeTemplates = TranscodeTemplates_1.default.getAvailableTemplates();
        return new RouteResult_1.default(200, availableTranscodeTemplates);
    }),
};
//# sourceMappingURL=transcode-status.js.map