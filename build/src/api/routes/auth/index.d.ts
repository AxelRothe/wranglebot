declare const _default: ({
    method: string;
    url: string;
    public: boolean;
    handler: (req: any, res: any, wranglebot: any, socketServer: any) => Promise<import("../../RouteResult").default>;
} | {
    method: string;
    url: string;
    requiredRole: string[];
    handler: (req: any, res: any, bot: import("../../../WrangleBot").WrangleBot, socketServer: import("../../SocketServer").SocketServer) => Promise<import("../../RouteResult").default>;
} | {
    method: string;
    requiredParams: string[];
    url: string;
    handler: (req: any, res: any, wrangleBot: any, socketServer: any) => Promise<import("../../RouteResult").default | undefined>;
} | {
    method: string;
    requiredRole: string[];
    url: string;
    handler: (req: any, res: any, bot: any, socketServer: any) => Promise<import("../../RouteResult").default | undefined>;
})[];
export default _default;
//# sourceMappingURL=index.d.ts.map