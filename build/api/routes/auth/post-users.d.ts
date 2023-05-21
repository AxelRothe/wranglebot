import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";
declare const _default: {
    method: string;
    url: string;
    requiredBody: string[];
    requiredRole: string[];
    handler: (req: any, res: any, bot: WrangleBot, socketServer: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=post-users.d.ts.map