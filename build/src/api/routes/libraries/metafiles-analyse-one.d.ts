import { SocketServer } from "../../SocketServer";
import { WrangleBot } from "../../../core/WrangleBot";
import RouteResult from "../../RouteResult";
declare const _default: {
    method: string;
    requiredRole: string[];
    requiredParams: string[];
    requiredBody: string[];
    url: string;
    handler: (req: any, res: any, bot: WrangleBot, server: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=metafiles-analyse-one.d.ts.map