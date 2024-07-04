declare const _default: ({
    method: string;
    url: string;
    handler: (req: any, res: any, bot: import("../../../index.js").WrangleBot, socketServer: import("../../SocketServer.js").SocketServer) => Promise<import("../../RouteResult.js").default>;
} | {
    method: string;
    requiredParams: string[];
    url: string;
    handler: (req: any, res: any, wrangleBot: any, socketServer: any) => Promise<import("../../RouteResult.js").default | undefined>;
} | {
    method: string;
    requiredRole: string[];
    url: string;
    handler: (req: any, res: any, bot: any, socketServer: any) => Promise<import("../../RouteResult.js").default | undefined>;
})[];
export default _default;
//# sourceMappingURL=index.d.ts.map