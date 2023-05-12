"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class User {
    constructor(options) {
        this.roles = []; // ["admin", "maintainer", "contributor", "curator"]
        this.libraries = []; //@deprecated
        this.config = {};
        this.token = "";
        if (!options.username)
            throw new Error("Username is required");
        if (!options.password)
            throw new Error("Password is required");
        this.id = options.id || (0, uuid_1.v4)();
        this.firstName = options.firstName;
        this.lastName = options.lastName;
        this.username = options.username;
        this.password = options.password;
        this.email = options.email;
        this.roles = options.roles || [];
        this.libraries = options.libraries || []; //@deprecated
        this.config = options.config || {};
    }
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    update(options) {
        this.username = options.username || this.username;
        this.firstName = options.firstName || this.firstName;
        this.lastName = options.lastName || this.lastName;
        this.email = options.email || this.email;
        this.roles = options.roles || this.roles;
        this.libraries = options.libraries || this.libraries; //@deprecated
        this.config = options.config ? Object.assign(Object.assign({}, this.config), options.config) : this.config;
    }
    /**
     * @description Checks if the user has the specified role or roles
     * @param role The role or roles to check
     * @returns {boolean} True if the user has the role or roles, false otherwise
     */
    hasRole(role) {
        if (typeof role === "string") {
            return this.roles.includes(role);
        }
        return role.some((r) => this.roles.includes(r));
    }
    setConfig(options) {
        this.config = Object.assign(Object.assign({}, this.config), options);
    }
    /**
     * @description Returns a JSON representation of the user
     * @param options set db to true to include the hashed password
     */
    toJSON(options = { db: false }) {
        return {
            id: this.id,
            username: this.username,
            firstName: this.firstName,
            lastName: this.lastName,
            password: options.db ? this.password : undefined,
            email: this.email,
            roles: this.roles,
            libraries: this.libraries,
            config: this.config,
        };
    }
}
exports.default = User;
//# sourceMappingURL=User.js.map