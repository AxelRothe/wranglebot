declare const _default: ({
    method: string;
    url: string;
    handler: (req: any, res: any, bot: import("../../core/WrangleBot.js").WrangleBot, socketServer: import("../SocketServer.js").SocketServer) => Promise<import("../RouteResult.js").default>;
} | {
    method: string;
    url: string;
    handler: (req: any, res: any, bot: import("../../core/WrangleBot.js").WrangleBot, server: import("../SocketServer.js").SocketServer) => Promise<void>;
} | {
    method: string;
    url: string;
    handler: (req: any, res: any, bot: any, server: any) => Promise<import("../RouteResult.js").default | undefined>;
})[];
export default _default;
//# sourceMappingURL=index.d.ts.map