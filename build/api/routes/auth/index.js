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
const reset_password_1 = __importDefault(require("./reset-password"));
const get_users_me_balance_1 = __importDefault(require("./get-users-me-balance"));
const get_users_me_1 = __importDefault(require("./get-users-me"));
exports.default = [login_1.default, get_users_1.default, put_users_1.default, delete_users_1.default, post_users_1.default, reset_password_1.default, get_users_me_balance_1.default, get_users_me_1.default];
//# sourceMappingURL=index.js.map