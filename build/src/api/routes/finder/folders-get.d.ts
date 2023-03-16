import { WrangleBot } from "../../../WrangleBot";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";
declare const _default: {
    method: string;
    requiredParams: string[];
    requiredRole: string[];
    url: string;
    handler: (req: any, res: any, bot: WrangleBot, socketServer: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=folders-get.d.ts.map