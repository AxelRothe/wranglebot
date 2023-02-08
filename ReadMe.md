# Welcome to Wranglebot

Wranglebot is an open source media asset management tool designed to make digital asset management simple. Whether you are a media producer, content creator, or any other type of professional in the media industry, Wranglebot can help you manage and organize your assets.

## Getting Started

To build Wranglebot, you will need to have Node.js installed on your computer. For detailed instructions, please refer to our documentation.


### Build the app

```
npm run install
npm run build
```

### Start wranglebot server in test enviroment

```
npm run test
```

You will require a `.env` to run the test enviroment:

```
CLOUD_SYNC_DATABASE_KEY="xxxx-xxxx-xxxx-xxxx" //get at wranglebot.io  
CLOUD_SYNC_TOKEN="xxxx-xxxx-xxxx-xxxx" //please contact for developer token
CLOUD_SYNC_DATABASE_URL="https://db2.wranglebot.io"
DEBUG_NOTIFICATIONS="false" //show notifications in console
```

## Features

Wranglebot offers a variety of features to make asset management easier and more efficient:

- Ingest: Copy & Verify
    - ingest entire volumes or individual folders to media library
    - auto scan, extract meta data, generate unique hash using xxHash3 algorithm
    - extract thumbnails from video footage for cloud preview
- Manage Metadata
    - edit and view metadata in advanced meta data editor
    - extract and scrub through thumbnails
- Library Management
    - create bins to manage media into categories and tags
    - import new files from "watched" bins
    - app automatically relocates and connects to storage devices
- Export and Transcode
    - transcode media to ProRes and DNxHD up to 4K
    - export with LUTs
- Live Syncing
    - app syncs itself between devices in realtime
    - offload on one device and tag it at another studio
- Open Source
    - web-app and engine open source
    - written in NodeJS, Typescript & C++
    - Javascript API
    - fully controllable via REST API
    - currently supports intel and silicon MacOS

## Documentation

For more information, please refer to the `api.yaml` YAML File on how to use the API.

## Discord

Join our [Discord](https://discord.gg/p3Rmhagvkm) for live support.

## Contributing

We welcome contributions to Wranglebot! Please read our contribution guidelines before submitting a pull request.

## License

Wranglebot is released under the GPL-3.0 License. For more information, please view the license. 