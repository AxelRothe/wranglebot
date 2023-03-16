export default class User {
    id: any;
    username: any;
    password: any;
    firstName: any;
    lastName: any;
    email: any;
    roles: string[];
    libraries: never[];
    query: any;
    token: string;
    constructor(options: any);
    get fullName(): string;
    update(options: any): void;
    toJSON({ db }: {
        db?: boolean | undefined;
    }): {
        id: any;
        username: any;
        firstName: any;
        lastName: any;
        password: any;
        email: any;
        roles: string[];
        libraries: never[];
    };
}
//# sourceMappingURL=User.d.ts.map