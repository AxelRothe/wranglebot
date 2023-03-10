const LogBot = require("logbotjs");
const wb = require("../build/src/");
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
  token: conf.token,
  database: conf.database,
  mlserver: conf.mlserver,
});

if (conf.debugNotifications) {
  wb.on("notification", (notification) => {
    console.log("NOTIFICATION: " + notification.title + " - " + notification.message);
  });
}

wb.on("connectedToCloud", async (bot) => {
  LogBot.endSpinner("load", "success", "Loaded " + wb.index.libraries.length + " libraries");
});

wb.on("failedToConnectToCloud", async (bot) => {
  LogBot.endSpinner("load", "failure", "Failed to start wranglebot.");
});
