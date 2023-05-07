# Welcome to WrangleBot

![GitHub last commit](https://img.shields.io/github/last-commit/AxelRothe/wranglebot)
![GitHub package.json version](https://img.shields.io/github/package-json/v/AxelRothe/wranglebot)
![GitHub repo size](https://img.shields.io/github/repo-size/AxelRothe/wranglebot)
![Platforms](https://img.shields.io/badge/platforms-macos%20(x64%2C%20arm64)-blue)
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
  - requires a wallet at [wranglebot.io](https://wranglebot.io/account)
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
- Open Source
  - open NodeJS engine and browser client
  - written in NodeJS with Typescript
  - Javascript API, that uses chained commands and is easy to use without knowledge of the underlying code
  - fully controllable via REST API
  - currently supports both Intel x64 and AMD64 Silicon M1+ MacOS and Linux Distros

--- 

## 👋 Getting Started

To build WrangleBot, you will need to have [Node.js](https://nodejs.org/en/) installed on your computer.

### 📦 Install

Create a new folder and clone the repository into it. Then, run `npm install` to install all of the dependencies. After that, run `npm run build` to build the application. Finally, run `npm run test` to start the application.

Alternatively you can use npm to install wranglebot using `npm install wranglebot` in your newly created folder.

### 🛠 Build

```bash
npm run build
```

### 🚀 Start WrangleBot in test environment

```bash
npm run test
```

⚠️ You will require a `.env` to run the test environment:

```dotenv
CLOUD_SYNC_DATABASE_TOKEN="xxxx-xxxx-xxxx-xxxx" #please contact for developer token
CLOUD_SYNC_DATABASE_URL="https://db2.wranglebot.io"
CLOUD_ML_URL="https://ai.wranglebot.io" # you will need a positive credits balance, you can charge your wallet at wranglebot.io
DEBUG_NOTIFICATIONS="false" #show notifications in console
```

## 🪨 Offline Mode

If you are not using Cloud Sync, then you can use the offline mode. This mode will allow you to use WrangleBot without an internet connection. To use the offline mode, you will need to create a `.env` file in the root directory of the project. The `.env` file should contain the following:

> Note: You will not be able to use AI Services in offline mode, as they are tied to your Cloud Sync account. If you need to migrate an offline database to Cloud Sync please write us an email at [a.rothe@vanrothe.com](mailto:a.rothe@vanrothe.com)

```dotenv
DATABASE_KEY="xxxx-xxxx-xxxx-xxxx"
```

The key can be any string of characters.

## Starting via NodeJS

```js
wranglebot.open({
  client: {
    database: {
      cloud: {
        token: "<YOUR_DATABASE_TOKEN>",
        databaseURL: "https://db2.wranglebot.io",
        machineLearningURL: "https://ai.wranglebot.io",
      },
    },
    port: 3200,
  }
})
```


```js
wranglebot.open({
  client: {
    database: {
      local: {
        key: "<YOUR_DATABASE_NAME>"
      },
    },
    port: 3200,
  }
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

## 📜 License 

WrangleBot is released under the GPL-3.0 License. For more information, please view the license. You must publish all changes and modifications to the source code under the same license. We encourage you to contribute to the project and make it better for everyone.

---

## ⚠️ Limitations & Data Privacy Concerns
### Read Before Using!

As of right now, WrangleBot is still in development. This means that there are some limitations to what WrangleBot can do.

**These limitations are as follows:**

- WrangleBot **Cloud Sync does not yet utilize end-to-end encryption** to protect your data, but uses TLS-Encryption to communicate and send data between you and the cloud sync servers. This means that **your data is encrypted while it is in transit, but not while it is stored on the cloud sync servers**.

We are committed to addressing these limitations and implementing new features as soon as possible. We are also committed to protecting your data and privacy. We will never sell your data to third parties, and we will never use your data for any other purpose than to provide you with the best possible experience with WrangleBot. Please review our data [privacy policy here](https://wranglebot.io/privacy) for more information.

---

## License

WrangleBot is released under the GPL-3.0 License. For more information, please view the license. You must publish all changes and modifications to the source code under the same license. We encourage you to contribute to the project and make it better for everyone.
