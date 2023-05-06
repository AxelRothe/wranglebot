declare const _default: ({
    method: string;
    url: string;
    handler: (req: any, res: any, bot: import("../../core/WrangleBot").WrangleBot, server: import("../SocketServer").SocketServer) => Promise<import("../RouteResult").default>;
} | {
    method: string;
    requiredRole: string[];
    url: string;
    handler: (req: any, res: any, bot: import("../../core/WrangleBot").WrangleBot, server: import("../SocketServer").SocketServer) => Promise<void>;
} | {
    method: string;
    url: string;
    handler: (req: any, res: any, bot: any, server: any) => Promise<import("../RouteResult").default | undefined>;
})[];
export default _default;
//# sourceMappingURL=index.d.ts.map