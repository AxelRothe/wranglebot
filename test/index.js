const LogBot = require("logbotjs");
const wb = require("../build/src/");
LogBot.verbose = true;
const {config } = require('dotenv')
config()

LogBot.addSpinner("load", "Loading...");

let conf = {
  debugNotifications: process.env.DEBUG_NOTIFICATIONS === "true",
}

if (process.env.DATABASE_KEY){
  conf.key = process.env.DATABASE_KEY
} else {
  conf = {
    ...conf,
    key: process.env.CLOUD_SYNC_DATABASE_KEY,
    token: process.env.CLOUD_SYNC_TOKEN,
    database : process.env.CLOUD_SYNC_DATABASE_URL,
  }
}

console.log("LOADING CONFIG")
console.log(conf);

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
