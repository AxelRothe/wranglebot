import RouteResult from "../../RouteResult.js";
import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
declare const _default: {
    method: string;
    requiredRole: string[];
    url: string;
    handler: (req: any, res: any, bot: WrangleBot, server: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=library-post-load.d.ts.map