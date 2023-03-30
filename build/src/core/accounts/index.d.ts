import User from "./User";
declare const _default: {
    AccountManager: {
        users: Set<User>;
        salt: string;
        init(): Promise<void>;
        addOneUser(options: import("./createUserOptions").default): User;
        removeOneUser(user: any): boolean;
        getAllUsers(filters?: {}): User[];
        getOneUser(username: any): User | undefined;
        addRole(user: User, role: any): boolean;
        setRoles(user: User, roles: any): boolean;
        removeRole(user: User, role: any): boolean;
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
    };
    User: typeof User;
};
export default _default;
//# sourceMappingURL=index.d.ts.map