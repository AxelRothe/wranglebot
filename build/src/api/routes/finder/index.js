"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const volumes_get_1 = __importDefault(require("./volumes-get"));
const folders_get_1 = __importDefault(require("./folders-get"));
const utility_index_1 = __importDefault(require("./utility-index"));
const utility_luts_1 = __importDefault(require("./utility-luts"));
const volume_unmount_1 = __importDefault(require("./volume-unmount"));
exports.default = [
    volumes_get_1.default,
    folders_get_1.default,
    utility_index_1.default,
    utility_luts_1.default,
    volume_unmount_1.default,
];
//# sourceMappingURL=index.js.map