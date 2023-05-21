import { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer.js";
import RouteResult from "../../RouteResult.js";
declare const _default: {
    method: string;
    requiredParams: string[];
    url: string;
    handler: (req: any, res: any, bot: WrangleBot, socketServer: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=folders-get.d.ts.map