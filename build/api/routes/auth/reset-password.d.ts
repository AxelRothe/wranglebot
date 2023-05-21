import RouteResult from "../../RouteResult.js";
import { SocketServer } from "../../SocketServer.js";
import { WrangleBot } from "../../../core/WrangleBot.js";
declare const _default: {
    method: string;
    requiredParams: string[];
    public: boolean;
    url: string;
    handler: (req: any, res: any, bot: WrangleBot, socketServer: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=reset-password.d.ts.map