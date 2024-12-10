![wranglebot-logo](https://wranglebot.io/assets/images/logo.png)

# WrangleBot - Media Asset Management Platform

![GitHub last commit](https://img.shields.io/github/last-commit/AxelRothe/wranglebot)
![GitHub package.json version](https://img.shields.io/github/package-json/v/AxelRothe/wranglebot)
![GitHub repo size](https://img.shields.io/github/repo-size/AxelRothe/wranglebot)
![Platforms](https://img.shields.io/badge/platforms-macos%20linux-blue)
![Discord](https://img.shields.io/discord/1070819210265104434?logo=discord&logoColor=blue)

---

WrangleBot is an open source media asset management platform engine.
---

## 🧰 Features

WrangleBot offers a variety of features to make asset management easier and more efficient:

- Ingest: Copy & Verify
  - ingest entire volumes or individual folders to your media libraries
  - auto scan, extract meta data, generate unique hash using xxHash algorithms
  - extract thumbnails from video footage for cloud preview
- Manage Metadata
  - edit and view metadata in advanced meta data editor
  - extract and scrub through thumbnails
- Library Management
  - create bins to manage media into categories and tags
  - import new files from "watched" bins
  - app automatically relocates and connects to storage devices
- Export and Transcode
  - transcode media to ProRes, H264 and DNxHD up to 4K
  - export with LUTs
- Open Source
  - open NodeJS engine and browser client
  - written in NodeJS with Typescript
  - Javascript API, that uses chained commands and is easy to use without knowledge of the underlying code
  - fully controllable via REST API
  - currently supports both Intel x64 and AMD64, as well as Apple Silicon

--- 

## 👋 Getting Started

To build WrangleBot, you will need to have [Node.js](https://nodejs.org/en/) installed on your computer.

### 📦 Install

```bash
npm install wranglebot
```

Then, run `npm install` to install all the dependencies. After that, run `npm run build` to build the application. Finally, run `npm run test` to start the application.

## 🚀 Booting up Instance

```js
wranglebot.open({
  app_data_location: "<APP_DATA_LOCATION>",
  vault: {
    token: "<LOCAL_DATABASE_TOKEN>"
  },
  port: 3200,
  //optional
  mail: {
    host: "<SMTP_HOST>",
    port: "<SMTP_PORT>",
    auth: {
      user: "<SMTP_USER>",
      pass: "<SMTP_PASS>",
    },
  },
})
```

## 📑 REST API Documentation

[(Postman) REST API with Examples](https://documenter.getpostman.com/view/26212996/2s93JtQPKd)

## 📑 NodeJS Documentation

[(GitBook) NodeJS API & Model Documentation](https://van-rothe.gitbook.io/wranglebot-nodejs-documentation/)

## 💬 Discord

Join our [Discord](https://discord.gg/p3Rmhagvkm) for live support.

## 👥 Contributing

We welcome contributions to WrangleBot! Please join us on our Discord to discuss how you can help. We are always looking for new contributors to help us build the best media asset management tool possible and want to make it as easy as possible for you to get involved.

## 🛠 NPM Scripts and Testing

### Build

```bash
npm run build
```

### Running Test Environment

Build the application and run the test environment:

⚠️ You will require a `.env` to run the test environment:

```dotenv
APP_DATA_LOCATION="<YOUR_APP_DATA_LOCATION>" // choose your app data location, i.e. "/Users/username/.wranglebot"
LOCAL_DATABASE_TOKEN="<YOUR_DATABASE>" // choose your database token to connect to the database, i.e. "my_database"

DEBUG_NOTIFICATIONS="false" #show notifications in console (true/false)

SMTP_HOST="<YOUR_EMAIL_HOST>"
SMTP_PORT="<YOUR_EMAIL_SMTP_PORT>" # 465 for SSL, 587 for TLS
SMTP_USER="<YOUR_EMAIL_USERNAME>"
SMTP_PASS="<YOUR_EMAIL_PASS>"
```

```bash
npm run test
```

---

## 📜 License

WrangleBot is released under the GPL-3.0 License. For more information, please view the license. You must publish all changes and modifications to the source code under the same license. We encourage you to contribute to the project and make it better for everyone.