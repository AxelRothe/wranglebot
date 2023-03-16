import RouteResult from "../../RouteResult";
import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
declare const _default: {
    method: string;
    url: string;
    requiredRole: string[];
    handler: (req: any, res: any, bot: WrangleBot, server: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=library-post-one.d.ts.map