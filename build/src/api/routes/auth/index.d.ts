declare const _default: ({
    method: string;
    url: string;
    requiredRole: string;
    handler: (req: any, res: any, bot: import("../../../WrangleBot").WrangleBot, socketServer: import("../../SocketServer").SocketServer) => Promise<import("../../RouteResult").default>;
} | {
    method: string;
    url: string;
    handler: (req: any, res: any, bot: any, socketServer: any) => Promise<import("../../RouteResult").default | undefined>;
})[];
export default _default;
//# sourceMappingURL=index.d.ts.map