import LogBot from "logbotjs";
import wb from "../build/index.js";

import { config } from "dotenv";

LogBot.verbose = true;

config();

LogBot.addSpinner("load", "Loading...");

let conf = {
  debugNotifications: process.env.DEBUG_NOTIFICATIONS === "true",
};

wb.open({
  vault: {
    token: process.env.CLOUD_SYNC_DATABASE_TOKEN,
    sync_url: process.env.CLOUD_SYNC_DATABASE_URL,
    ai_url: process.env.CLOUD_SYNC_MACHINE_LEARNING_URL,
  },
  port: 3200,
  secret: process.env.VAULT_JWT_SECRET,
  mail: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
});

if (conf.debugNotifications) {
  wb.on("notification", (notification) => {
    console.log("NOTIFICATION: " + notification.title + " - " + notification.message);
  });
}

wb.on("ready", async (bot) => {
  LogBot.endSpinner("load", "success", "Loaded " + wb.index.libraries.length + " libraries");

  // wb.query.library
  //   .one("kosmofilms")
  //   .metafiles.post("/Volumes/NVME/example/F003/F003C016_190925_MN99.mxf")
  //   .then((result) => {
  //     console.log(result);
  //   });

  // wb.query.library
  //   .one("kosmofilms")
  //   .metafiles.one("40c87933-8597-4a77-8dae-9e244a87f0fa")
  //   .metacopies.post({
  //     pathToSource: "/Volumes/NVME/example/F003/F003C016_190925_MN99.mxf",
  //     hash: "O+NG6NkO",
  //   })
  //   .then((result) => {
  //     console.log(result);
  //   });
});

wb.on("error", async (bot) => {
  LogBot.endSpinner("load", "failure", "Failed to start wranglebot.");
});
