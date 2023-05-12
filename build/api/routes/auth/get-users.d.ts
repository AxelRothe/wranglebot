import type { WrangleBot } from "../../../core/WrangleBot.js";
import { SocketServer } from "../../SocketServer";
import RouteResult from "../../RouteResult";
/**
 * @description Retrieves all users in the database
 */
declare const _default: {
    method: string;
    url: string;
    handler: (req: any, res: any, bot: WrangleBot, socketServer: SocketServer) => Promise<RouteResult>;
};
export default _default;
//# sourceMappingURL=get-users.d.ts.map