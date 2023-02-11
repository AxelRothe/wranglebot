"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const login_1 = __importDefault(require("./login"));
const get_users_1 = __importDefault(require("./get-users"));
const put_users_1 = __importDefault(require("./put-users"));
const delete_users_1 = __importDefault(require("./delete-users"));
const post_users_1 = __importDefault(require("./post-users"));
exports.default = [
    login_1.default,
    get_users_1.default,
    put_users_1.default,
    delete_users_1.default,
    post_users_1.default,
];
//# sourceMappingURL=index.js.map