import { WrangleBot } from "./WrangleBot.js";
export default interface Extension {
    name: string;
    description: string;
    version: string;
    events: string[];
    handler: (event: string, data: any, bot: WrangleBot) => void;
}
//# sourceMappingURL=Extension.d.ts.map