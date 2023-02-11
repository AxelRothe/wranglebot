interface ClientCallbacks {
    event: string;
    callback: (data: any) => void;
}
interface ClientSubscriptions {
    [key: string]: string[];
}
export default class Client {
    /**
     * @type {Socket}
     */
    socket: any;
    username: any;
    callbacks: ClientCallbacks[];
    subscriptions: ClientSubscriptions;
    constructor(socket: any, username: any);
    /**
     * Adds a Hook to the Client
     *
     * @example
     * client.addHook("message", (data : Betweeny) => {
     *  console.log(data);
     * });
     *
     * @param event {string} The event to listen for
     * @param callback {function} The callback to run when the event is triggered
     *
     */
    addHook(event: any, callback: any): void;
    /**
     * to be used after changing the socket
     *
     * @example
     * client.syncHooks();
     *
     * @returns {void}
     */
    syncHooks(): void;
}
export {};
//# sourceMappingURL=Client.d.ts.map