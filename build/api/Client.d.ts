interface ClientCallbacks {
    event: string;
    callback: (data: any) => void;
}
interface ClientSubscriptions {
    [key: string]: string[];
}
export default class Client {
    socket: any;
    username: any;
    callbacks: ClientCallbacks[];
    subscriptions: ClientSubscriptions;
    constructor(socket: any, username: any);
    addHook(event: any, callback: any): void;
    syncHooks(): void;
}
export {};
//# sourceMappingURL=Client.d.ts.map