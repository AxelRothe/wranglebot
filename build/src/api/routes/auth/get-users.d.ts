import type { WrangleBot } from "../../../WrangleBot.js";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";
declare const _default: {
    method: string;
    url: string;
    requiredRole: string;
    handler: (req: any, res: any, bot: WrangleBot, socketServer: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=get-users.d.ts.map