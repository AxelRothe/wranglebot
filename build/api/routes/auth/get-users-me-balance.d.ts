import type { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";
/**
 * @description Retrieves the balance that is associated with the authenticated user
 */
declare const _default: {
    method: string;
    url: string;
    handler: (req: any, res: any, bot: WrangleBot, server: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=get-users-me-balance.d.ts.map