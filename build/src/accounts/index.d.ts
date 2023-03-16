import User from "./User";
declare const _default: {
    AccountManager: {
        users: Set<User>;
        salt: string;
        init(): Promise<void>;
        addOneUser(options: any): User;
        removeOneUser(user: any): boolean;
        getAllUsers(filters?: {}): User[];
        getOneUser(username: any): User | undefined;
        addRole(user: any, role: any): boolean;
        setRoles(user: any, roles: any): boolean;
        removeRole(user: any, role: any): boolean;
        hasRole(user: any, roles: any): boolean;
        changePassword(user: any, password: any): any;
        changeEmail(user: any, email: any): any;
        changeFirstName(user: any, firstName: any): any;
        changeLastName(user: any, lastName: any): any;
        allowAccess(user: any, library: any): boolean;
        revokeAccess(user: any, library: any): boolean;
        checkAuth(username: any, password: any): boolean;
    };
    User: typeof User;
};
export default _default;
//# sourceMappingURL=index.d.ts.map