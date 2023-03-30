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
const User_1 = __importDefault(require("./User"));
const DB_1 = __importDefault(require("../database/DB"));
const md5_1 = __importDefault(require("md5"));
const uuid_1 = require("uuid");
class AccountManager {
    constructor() {
        this.users = new Set();
        this.salt = "Wr4ngle_b0t"; //TODO: Salt needs to be stored somewhere else
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fetchedUsers = (0, DB_1.default)().getMany("users", {});
                if (fetchedUsers.length > 0) {
                    for (const user of fetchedUsers) {
                        yield this.addOneUser({
                            id: user.id,
                            username: user.username,
                            password: user.password,
                            email: user.email,
                            roles: user.roles,
                            libraries: user.libraries,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            create: false,
                        });
                    }
                }
            }
            catch (e) {
                throw e;
            }
        });
    }
    addOneUser(options) {
        let user = this.getOneUser(options.username);
        if (options.create) {
            if (user) {
                throw new Error("User already exists");
            }
            let p = (0, md5_1.default)(options.password + this.salt);
            user = new User_1.default({
                username: options.username,
                password: p,
                email: options.email,
                roles: options.roles,
                libraries: options.libraries,
                firstName: options.firstName,
                lastName: options.lastName,
            });
            (0, DB_1.default)().updateOne("users", { id: user.id }, user.toJSON({ db: true }));
            this.users.add(user);
        }
        else {
            if (user) {
                user.update({
                    username: options.username,
                    password: options.password,
                    email: options.email,
                    roles: options.roles,
                    libraries: options.libraries,
                    firstName: options.firstName,
                    lastName: options.lastName,
                });
            }
            else {
                user = new User_1.default({
                    id: options.id,
                    username: options.username,
                    password: options.password,
                    email: options.email,
                    roles: options.roles,
                    libraries: options.libraries,
                    firstName: options.firstName,
                    lastName: options.lastName,
                });
                this.users.add(user);
            }
        }
        return user;
    }
    removeOneUser(user) {
        const removed = (0, DB_1.default)().removeOne("users", { id: user.id });
        if (removed) {
            this.users.delete(user);
            return true;
        }
        else {
            return false;
        }
    }
    getAllUsers(filters = {}) {
        const users = Array.from(this.users);
        let c = {};
        if (Object.keys(filters).length === 0)
            return users;
        return users.filter((u) => {
            for (let key in filters) {
                if (!c[key])
                    c[key] = [];
                if (u[key] && u[key] instanceof Array) {
                    if (u[key] && u[key].includes(filters[key]))
                        return true;
                }
                else {
                    if (u[key] === filters[key])
                        return true;
                }
            }
        });
    }
    getOneUser(username) {
        return this.getAllUsers().find((u) => u.username === username);
    }
    addRole(user, role) {
        if (!user.roles.includes(role)) {
            user.roles.push(role);
            const res = (0, DB_1.default)().updateOne("users", { id: user.id }, {
                roles: user.roles,
            });
            if (res)
                return true;
            user.roles.splice(user.roles.indexOf(role), 1); //remove it, if it failed
            return false;
        }
        return false;
    }
    setRoles(user, roles) {
        user.roles = roles;
        const res = (0, DB_1.default)().updateOne("users", { id: user.id }, {
            roles: user.roles,
        });
        return !!res;
    }
    removeRole(user, role) {
        if (user.roles.indexOf(role) > -1) {
            user.roles.splice(user.roles.indexOf(role), 1);
            const res = (0, DB_1.default)().updateOne("users", { id: user.id }, {
                roles: user.roles,
            });
            if (res)
                return true;
            user.roles.push(role); //put it back, if it failed
            return false;
        }
        return false;
    }
    /**
     * compares the user's roles to the roles passed in
     * if the user has any of the roles, it returns true
     * if the user has none of the roles, it returns false
     *
     * @param user
     * @param roles
     */
    hasRole(user, roles) {
        for (const role of roles) {
            if (user.roles.includes(role))
                return true;
        }
        return false;
    }
    changePassword(user, password) {
        user.password = (0, md5_1.default)(password + this.salt);
        return (0, DB_1.default)().updateOne("users", { id: user.id }, {
            password: user.password,
        });
    }
    changeEmail(user, email) {
        user.email = email;
        return (0, DB_1.default)().updateOne("users", { id: user.id }, {
            email: user.email,
        });
    }
    changeFirstName(user, firstName) {
        user.firstName = firstName;
        return (0, DB_1.default)().updateOne("users", { id: user.id }, {
            firstName: user.firstName,
        });
    }
    changeLastName(user, lastName) {
        user.lastName = lastName;
        return (0, DB_1.default)().updateOne("users", { id: user.id }, {
            lastName: user.lastName,
        });
    }
    updateUser(user, options) {
        if (options.password) {
            if (options.password.length < 8)
                throw new Error("Password must be at least 8 characters long");
            //must contain at least one number, one lowercase letter, one uppercase letter, and one special character
            if (options.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/) === null)
                throw new Error("Password must contain at least one number, one lowercase letter, one uppercase letter, and one special character");
        }
        let email = options.email;
        let roles = options.roles;
        let password = options.password ? (0, md5_1.default)(options.password + this.salt) : undefined;
        let libraries = options.libraries;
        let firstName = options.firstName;
        let lastName = options.lastName;
        const updatedOptions = {
            email,
            roles,
            password,
            libraries,
            firstName,
            lastName,
        };
        user.update(updatedOptions);
        return (0, DB_1.default)().updateOne("users", { id: user.id }, updatedOptions);
    }
    allowAccess(user, library) {
        if (!user.libraries.includes(library)) {
            user.libraries.push(library);
            const res = (0, DB_1.default)().updateOne("users", { id: user.id }, {
                libraries: user.libraries,
            });
            if (res)
                return true;
            user.libraries.splice(user.libraries.indexOf(library), 1); //remove it, if it failed
            return true;
        }
        return false;
    }
    revokeAccess(user, library) {
        const s = user.libraries.length;
        user.libraries.splice(user.libraries.indexOf(library), 1);
        if (user.libraries.length !== s) {
            const res = (0, DB_1.default)().updateOne("users", { id: user.id }, {
                libraries: user.libraries,
            });
            if (res)
                return true;
            user.libraries.push(library); //put it back, if it failed
            return false;
        }
        return false;
    }
    resetPassword(user) {
        const password = (0, uuid_1.v4)();
        const res = this.changePassword(user, password);
        if (res)
            return password;
        return false;
    }
    checkAuth(username, password) {
        const user = this.getOneUser(username);
        if (!user)
            return false;
        return (0, md5_1.default)(password + this.salt) === user.password;
    }
}
exports.default = new AccountManager();
//# sourceMappingURL=AccountManager.js.map