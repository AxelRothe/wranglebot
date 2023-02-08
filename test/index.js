const LogBot = require("logbotjs");
const wb = require("../build/src/");
LogBot.verbose = true;
const {config } = require('dotenv')
config()

LogBot.addSpinner("load", "Loading...");

const conf = {
  token: process.env.CLOUD_SYNC_TOKEN,
  key: process.env.CLOUD_SYNC_DATABASE_KEY,
  database : process.env.CLOUD_SYNC_DATABASE_URL,
  debugNotifications: process.env.DEBUG_NOTIFICATIONS === "true",
}

console.log("LOADING CONFIG")
console.log(conf);

if (!conf.token || !conf.key || !conf.database) {
  LogBot.endSpinner("load", "failure", "Missing token, key, or database URL.");
  process.exit(1);
}

wb.open({
  token: conf.token,
  key: conf.key,
  database: conf.database
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
