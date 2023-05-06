"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = __importDefault(require("./auth"));
const finder_1 = __importDefault(require("./finder"));
const libraries_1 = __importDefault(require("./libraries"));
const social_1 = __importDefault(require("./social"));
exports.default = [
    ...auth_1.default,
    ...finder_1.default,
    ...libraries_1.default,
    ...social_1.default
];
//# sourceMappingURL=index.js.map