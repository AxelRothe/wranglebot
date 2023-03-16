import { WrangleBot } from "./WrangleBot";

export default interface Extension {
  name: string;
  description: string;
  version: string;
  events: string[];
  handler: (event: string, data: any, bot: WrangleBot) => void;
}
