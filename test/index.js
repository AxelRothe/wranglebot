// import from build folder because the source code is written in TypeScript and needs to be compiled to JavaScript.
// you can also use tsx if you want to compile at runtime.
import wb from "../build/index.js";

//get the environment variables
import { config } from "dotenv";
config();

//logbot is the internal logger for WrangleBot, it's also a standalone package that can be used in any project.
import LogBot from "logbotjs";

// check if all env variables are set
let envVars = [
  "APP_DATA_LOCATION",
  "LOCAL_DATABASE_TOKEN",
  "SERVER_PORT",
];

for (let envVar of envVars) {
  if (!process.env[envVar]) {
    LogBot.log(500, "Missing environment variable: " + envVar);
    process.exit(1);
  }
}

// opens the instance
wb.open({
  // where the app data is stored, i.e. /Users/username/.wranglebot or /my/nas/wb_data
  app_data_location: process.env.APP_DATA_LOCATION,
  vault: {
    // the id of the vault that you want to load from the app data location
    token: process.env.LOCAL_DATABASE_TOKEN,
  },
  // the port that the server will run on, i.e. 3200
  port: process.env.SERVER_PORT,
  // if you want to use the password reset function or any of the email functions, you need to set up an SMTP server and supply the credentials here.
  mail: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
});

/**
 * If you want to see all the notifications that WrangleBot is sending out, use the 'notification' event.
 */
if (process.env.DEBUG_NOTIFICATIONS === "true") {
  wb.on("notification", (notification) => {
    LogBot.log(100,"NOTIFICATION: " + notification.title + " - " + notification.message);
  });
}

/**
 * When WrangleBot is finished loading all the data into RAM it is ready to be used.
 * Always wait for this event before trying to use WrangleBot.
 */
wb.on("ready", async (bot) => {
  LogBot.log(200,"Wranglebot is ready.");
});

/**
 * Gracefully catch WrangleBot when it stumbles and falls.
 */
wb.on("error", async (bot) => {
  LogBot.log(500, "Failed to start wranglebot.")
});
