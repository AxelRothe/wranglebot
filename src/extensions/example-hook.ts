import { WrangleBot } from "../core/WrangleBot";

export default {
  name: "example-hook",
  description: "An example hook",
  version: "0.0.1",
  events: ["example-event"],
  handler: async (event: string, data: any, bot: WrangleBot) => {
    // Do something here
  },
};
