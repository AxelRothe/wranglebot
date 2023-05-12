declare const _default: ({
    method: string;
    url: string;
    handler: (req: any, res: any, bot: import("../../../core/WrangleBot").WrangleBot, server: import("../../SocketServer").SocketServer) => Promise<import("../../RouteResult").default>;
} | {
    method: string;
    url: string;
    handler: (req: any, res: any, bot: import("../../../core/WrangleBot").WrangleBot, server: import("../../SocketServer").SocketServer) => Promise<void>;
})[];
export default _default;
//# sourceMappingURL=index.d.ts.map