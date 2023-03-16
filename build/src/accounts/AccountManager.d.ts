import User from "./User";
declare class AccountManager {
    users: Set<User>;
    salt: string;
    init(): Promise<void>;
    addOneUser(options: any): User;
    removeOneUser(user: any): boolean;
    getAllUsers(filters?: {}): User[];
    getOneUser(username: any): User | undefined;
    addRole(user: any, role: any): boolean;
    removeRole(user: any, role: any): boolean;
    /**
     * compares the user's roles to the roles passed in
     * if the user has any of the roles, it returns true
     * if the user has none of the roles, it returns false
     *
     * @param user
     * @param roles
     */
    hasRole(user: any, roles: any): boolean;
    changePassword(user: any, password: any): any;
    changeEmail(user: any, email: any): any;
    changeFirstName(user: any, firstName: any): any;
    changeLastName(user: any, lastName: any): any;
    allowAccess(user: any, library: any): boolean;
    revokeAccess(user: any, library: any): boolean;
    checkAuth(username: any, password: any): boolean;
}
declare const _default: AccountManager;
export default _default;
//# sourceMappingURL=AccountManager.d.ts.map