# Vue Web Extension Starter

This is a starter template for building Chrome extensions using Vue.js. It provides a basic structure and setup to help you get started quickly.

## Features

- Vue.js for building the user interface
- Tailwindcss for styling
- Widgets for content scripts

## Pre-packed

- [Vue 3](https://v3.vuejs.org/)
- [Tailwindcss](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Prettier](https://prettier.io/)

## Getting Started

To get started with this starter template, follow these steps:

1. Clone this repository: `git clone https://github.com/codespikex/vue-webext-starter.git`
2. Install the dependencies: `pnpm install`
3. Build the extension: `pnpm build`
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions`
   - Enable the "Developer mode" toggle
   - Click on "Load unpacked" and select the `build` folder in the cloned repository

## Usage

This starter template provides a basic structure for building Chrome extensions using Vue.js. The main files and folders are:

- `src/`: Contains the source code for the extension
   - `service-worker.ts`: Contains the service worker code
   - `content-script.ts`: Contains the content script code
   - `popup.ts`: Contains the popup code
   - `components/`: Contains the Vue components
      - `widgets/`: Contains the widgets for content scripts
   - `utils/custom-elements.ts`: Contains the code for defining custom elements
- `public/`: Contains the public assets for the extension
- `assets/`: Contains the assets for the extension

## Development

During development, you can use the following commands:

- `pnpm watch`: Watches for changes and rebuilds the extension
- `npm build`: Builds the extension for production

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).