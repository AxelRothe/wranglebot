![wranglebot-logo](https://wranglebot.io/assets/images/logo.png)

# WrangleBot - Media Asset Management Platform

![GitHub last commit](https://img.shields.io/github/last-commit/AxelRothe/wranglebot)
![GitHub package.json version](https://img.shields.io/github/package-json/v/AxelRothe/wranglebot)
![GitHub repo size](https://img.shields.io/github/repo-size/AxelRothe/wranglebot)
![Platforms](https://img.shields.io/badge/platforms-macos%20linux-blue)
![Discord](https://img.shields.io/discord/1070819210265104434?logo=discord&logoColor=blue)

_Server Status_ ![Website](https://img.shields.io/website?label=Cloud%20Sync&url=https%3A%2F%2Fdb2.wranglebot.io%2Fversion) ![Website](https://img.shields.io/website?label=AI%20Services&url=https%3A%2F%2Fai.wranglebot.io%2Fversion)

---

WrangleBot is an open source media asset management tool designed to make digital asset management simple. Whether you are a media producer, content creator, or any other type of professional in the media industry, WrangleBot can help you manage and organize your assets.

## Desktop App

If you are looking for the Desktop App then please download the newest builds here: [Download WrangleBot Desktop App](https://wranglebot.io)

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
- Auto Tag with AI
  - tag over 1500 objects classes
  - detect landmarks and celebrities
  - 🌐 requires a wallet at [wranglebot.io](https://wranglebot.io/account)
- Library Management
  - create bins to manage media into categories and tags
  - import new files from "watched" bins
  - app automatically relocates and connects to storage devices
- Export and Transcode
  - transcode media to ProRes, H264 and DNxHD up to 4K
  - export with LUTs
- Live Syncing
  - app syncs itself between devices in realtime
  - offload on one device and tag it at another studio
  - 🌐 requires an account at [wranglebot.io](https://wranglebot.io/register)
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
  vault: {
    token: "<CLOUD_SYNC_DATABASE_TOKEN>",
    sync_url: "<CLOUD_SYNC_DATABASE_URL>",
    ai_url: "<CLOUD_SYNC_MACHINE_LEARNING_URL>",
  },
  port: 3200,
  secret: "<VAULT_JWT_SECRET>",
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

## 🪨 Offline Mode

Just omit the `sync_url` and `ai_url` and WrangleBot will start in offline mode.

```js
wranglebot.open({
  vault: {
    token: "<DATABASE_TOKEN>"
  },
  port: 3200,
  secret: "<VAULT_JWT_SECRET>",
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

```bash
npm run test
```

⚠️ You will require a `.env` to run the test environment:

```dotenv
CLOUD_SYNC_DATABASE_TOKEN="<YOUR_DATABASE_TOKEN>"  # get your token at wranglebot.io
CLOUD_SYNC_DATABASE_URL="https://db2.wranglebot.io"
CLOUD_SYNC_MACHINE_LEARNING_URL="https://ai.wranglebot.io" # you will need a positive credits balance, you can charge your wallet at wranglebot.io
VAULT_JWT_SECRET="<YOUR_SECRET>" // choose your secret to generate a JWT Secret for authenticating users

DEBUG_NOTIFICATIONS="false" #show notifications in console (true/false)

SMTP_HOST="<YOUR_EMAIL_HOST>"
SMTP_PORT="<YOUR_EMAIL_SMTP_PORT>" # 465 for SSL, 587 for TLS
SMTP_USER="<YOUR_EMAIL_USERNAME>"
SMTP_PASS="<YOUR_EMAIL_PASS>"
```

---

## 📜 License

WrangleBot is released under the GPL-3.0 License. For more information, please view the license. You must publish all changes and modifications to the source code under the same license. We encourage you to contribute to the project and make it better for everyone.

If you want to use the Cloud Syncing features and your company has more than $500,000 in revenue, you may need to register with us to acquire an enterprise license. Additionally, if you want to develop the engine or interface with proprietary features without re-releasing as LGPL, you will need to register for a commercial license. However, you are free to use the plugin system to code workflows, and it is unlikely that you will need to make drastic changes to the engine unless you require your own cloud database system or machine learning integrations.
