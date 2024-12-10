import wb from "../build/index.js";

import { config } from "dotenv";
import LogBot from "logbotjs";

config();

let conf = {
  debugNotifications: process.env.DEBUG_NOTIFICATIONS === "true",
};

// opens the instance
wb.open({
  app_data_location: process.env.APP_DATA_LOCATION,
  vault: {
    token: process.env.LOCAL_DATABASE_TOKEN,
  },
  port: 3200,
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
    LogBot.log(100,"NOTIFICATION: " + notification.title + " - " + notification.message);
  });
}

wb.on("ready", async (bot) => {
  LogBot.log(200,"Wranglebot is ready.");
});

wb.on("error", async (bot) => {
  LogBot.log(500, "Failed to start wranglebot.")
});
