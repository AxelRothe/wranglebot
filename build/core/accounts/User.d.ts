export default class User {
    id: any;
    username: any;
    password: any;
    firstName: any;
    lastName: any;
    email: any;
    roles: string[];
    libraries: never[];
    config: any;
    query: any;
    token: string;
    constructor(options: any);
    get fullName(): string;
    update(options: any): void;
    /**
     * @description Checks if the user has the specified role or roles
     * @param role The role or roles to check
     * @returns {boolean} True if the user has the role or roles, false otherwise
     */
    hasRole(role: string | string[]): boolean;
    setConfig(options: any): void;
    /**
     * @description Returns a JSON representation of the user
     * @param options set db to true to include the hashed password
     */
    toJSON(options?: {
        db: boolean;
    }): {
        id: any;
        username: any;
        firstName: any;
        lastName: any;
        password: any;
        email: any;
        roles: string[];
        libraries: never[];
        config: any;
    };
}
//# sourceMappingURL=User.d.ts.map