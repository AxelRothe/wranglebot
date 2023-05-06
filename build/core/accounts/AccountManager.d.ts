import User from "./User";
import createUserOptions from "./createUserOptions";
declare class AccountManager {
    users: Set<User>;
    salt: string;
    init(): Promise<void>;
    addOneUser(options: createUserOptions): User;
    updateUserConfig(user: User, config: any): void;
    removeOneUser(user: any): boolean;
    getAllUsers(filters?: {}): User[];
    getOneUser(username: any): User | undefined;
    addRole(user: User, role: any): boolean;
    setRoles(user: User, roles: any): boolean;
    removeRole(user: User, role: any): boolean;
    /**
     * compares the user's roles to the roles passed in
     * if the user has any of the roles, it returns true
     * if the user has none of the roles, it returns false
     *
     * @param user
     * @param roles
     */
    hasRole(user: User, roles: any): boolean;
    changePassword(user: User, password: any): any;
    changeEmail(user: User, email: any): any;
    changeFirstName(user: User, firstName: any): any;
    changeLastName(user: User, lastName: any): any;
    updateUser(user: User, options: any): any;
    allowAccess(user: any, library: any): boolean;
    revokeAccess(user: any, library: any): boolean;
    resetPassword(user: User): any;
    checkAuth(username: any, password: any): boolean;
}
declare const _default: AccountManager;
export default _default;
//# sourceMappingURL=AccountManager.d.ts.map