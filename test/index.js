const LogBot = require("logbotjs");
const wb = require("../build/");
LogBot.verbose = true;
const { config } = require("dotenv");
config();

LogBot.addSpinner("load", "Loading...");

let conf = {
  debugNotifications: process.env.DEBUG_NOTIFICATIONS === "true",
};

if (process.env.DATABASE_TOKEN) {
  conf.token = process.env.DATABASE_TOKEN;
} else {
  conf = {
    ...conf,
    token: process.env.CLOUD_SYNC_DATABASE_TOKEN,
    database: process.env.CLOUD_SYNC_DATABASE_URL,
    mlserver: process.env.CLOUD_ML_URL,
  };
}

wb.open({
  client: {
    database: {
      local: {
        key: "mykey",
      },
    },
    port: 3200,
  },
  mailConfig: {
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
});

wb.on("error", async (bot) => {
  LogBot.endSpinner("load", "failure", "Failed to start wranglebot.");
});
