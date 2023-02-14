# Welcome to WrangleBot

![GitHub last commit](https://img.shields.io/github/last-commit/AxelRothe/wranglebot)
![GitHub package.json version](https://img.shields.io/github/package-json/v/AxelRothe/wranglebot)
![GitHub repo size](https://img.shields.io/github/repo-size/AxelRothe/wranglebot)
![Platforms](https://img.shields.io/badge/platforms-macos%20(x64%2C%20arm64)-blue)
![Discord](https://img.shields.io/discord/1070819210265104434?logo=discord&logoColor=blue)

WrangleBot is an open source media asset management tool designed to make digital asset management simple. Whether you are a media producer, content creator, or any other type of professional in the media industry, WrangleBot can help you manage and organize your assets.

## Desktop App

If you are looking for the Desktop App then please download the newest builds here: [Download WrangleBot Desktop App](https://wranglebot.io)

---

## ⚠️ Limitations & Data Privacy Concerns
### Read Before Using!

As of right now, WrangleBot is still in development. This means that there are some limitations to what WrangleBot can do.

**These limitations are as follows:**

- WrangleBot is only available for MacOS. (We are looking for contributors to help us port WrangleBot to other platforms.)
- WrangleBot **Cloud Sync does not yet utilize end-to-end encryption** to protect your data, but uses TLS-Encryption to communicate and send data between you and the cloud sync servers. This means that **your data is encrypted while it is in transit, but not while it is stored on the cloud sync servers**.

We are committed to addressing these limitations and implementing new features as soon as possible. We are also committed to protecting your data and privacy. We will never sell your data to third parties, and we will never use your data for any other purpose than to provide you with the best possible experience with WrangleBot. Please review our data [privacy policy here](https://wranglebot.io/privacy) for more information.

---

## 👋 Getting Started

To build WrangleBot, you will need to have [Node.js](https://nodejs.org/en/) installed on your computer. 

### 📦 Install

Create a new folder and clone the repository into it. Then, run `npm install` to install all of the dependencies. After that, run `npm run build` to build the application. Finally, run `npm run test` to start the application.

Alternatively you can use npm to install wranglebot using `npm install wranglebot` in your newly created folder.

### 🛠 Build

```
npm run build
```

### 🚀 Start WrangleBot in test environment

```
npm run test
```

⚠️ You will require a `.env` to run the test environment:

```
CLOUD_SYNC_DATABASE_KEY="xxxx-xxxx-xxxx-xxxx" //get at wranglebot.io
CLOUD_SYNC_TOKEN="xxxx-xxxx-xxxx-xxxx" //please contact for developer token
CLOUD_SYNC_DATABASE_URL="https://db2.wranglebot.io"
DEBUG_NOTIFICATIONS="false" //show notifications in console
```

## 🪨 Offline Mode

If you are not using Cloud Sync, then you can use the offline mode. This mode will allow you to use WrangleBot without an internet connection. To use the offline mode, you will need to create a `.env` file in the root directory of the project. The `.env` file should contain the following:

```
DATABASE_KEY="xxxx-xxxx-xxxx-xxxx"
```

The key can be any string of characters.

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
- Live Syncing
    - app syncs itself between devices in realtime
    - offload on one device and tag it at another studio
- Open Source
    - web-app and engine open source
    - written in NodeJS with Typescript
    - Javascript API, that uses chained commands and is easy to use without knowledge of the underlying code
    - fully controllable via REST API
    - currently supports both Intel x64 and  AMD64 Silicon M1+ MacOS

## 📑 Documentation

For more information, please refer to the `api.yaml` YAML File on how to use the API. We are writing a full documentation for the API and the WrangleBot Engine.

## 💬 Discord

Join our [Discord](https://discord.gg/p3Rmhagvkm) for live support.

## 👥 Contributing

We welcome contributions to WrangleBot! Please join us on our Discord to discuss how you can help. We are always looking for new contributors to help us build the best media asset management tool possible and want to make it as easy as possible for you to get involved.

## 📜 License

WrangleBot is released under the GPL-3.0 License. For more information, please view the license. You must publish all changes and modifications to the source code under the same license. We encourage you to contribute to the project and make it better for everyone.
