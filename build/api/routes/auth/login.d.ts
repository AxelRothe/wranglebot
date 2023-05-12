import type { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";
declare const _default: {
    method: string;
    url: string;
    public: boolean;
    handler: (req: any, res: any, bot: WrangleBot, server: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=login.d.ts.map