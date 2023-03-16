import RouteResult from "../../RouteResult";
import { WrangleBot } from "../../../core/WrangleBot";
import { SocketServer } from "../../SocketServer";
declare const _default: {
    method: string;
    requiredRole: string[];
    url: string;
    handler: (req: any, res: any, bot: WrangleBot, server: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=library-post-load.d.ts.map