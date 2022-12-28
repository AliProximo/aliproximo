/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import("tailwindcss").Config} */
module.exports = {
  presets: [require("@acme/tailwind-config")],
  plugins: [require('daisyui')],
  daisyui: {
    themes: [{
      light: {
        ...require("daisyui/src/colors/themes")["[data-theme=light]"],
        neutral: "#2A586C",
        '.input-bordered': {
          'border-color': '#000000',
        },
        '.btn-outline': {
          'border-color': '#000000',
        }
      },
    }],
  }
};
