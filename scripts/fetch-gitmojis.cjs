#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-var-requires
const https = require('https');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TYPE_NAMES } = require('./helpers');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { exit } = require('process');

/**
 * Creates `gitmojis.json` for commitlint usage
 *
 * @param {Object} json - The json downloaded.
 * @param {Object[]} json.gitmojis - The gitmoji.dev content array
 * @param {string} json.gitmojis[].emoji - the pretty emoji representation
 * @param {string} json.gitmojis[].code - the emoji name
 * @param {string} json.gitmojis[].description - the meaning in gitmoji
 */
function createCommitlintTyping(json) {
  const emojiArray = json.gitmojis.map((e) => e.emoji);
  try {
    fs.writeFileSync('gitmojis.json', JSON.stringify(emojiArray));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  }
}

/**
 * Creates `types.json` for commitzen usage
 *
 * @param {Object} json - The json downloaded.
 * @param {Object[]} json.gitmojis - The gitmoji.dev content array
 * @param {string} json.gitmojis[].emoji - the pretty emoji representation
 * @param {string} json.gitmojis[].code - the emoji name
 * @param {string} json.gitmojis[].description - the meaning in gitmoji
 */
function createCommitzenTyping(json) {
  const commitTypes = json.gitmojis.map((e) => {
    const value = TYPE_NAMES.has(e.code) ? TYPE_NAMES.get(e.code) : 'error';

    return {
      ...e,
      name: `${value}:\t${e.emoji} ${e.description}`,
      value,
    };
  });

  try {
    fs.writeFileSync('types.json', JSON.stringify(commitTypes));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
  }
}

// NOTE: new url because of carloscuesta/gitmoji#1235
const url =
  'https://raw.githubusercontent.com/carloscuesta/gitmoji/master/packages/gitmojis/src/gitmojis.json';

https
  .get(url, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      let json;
      try {
        json = JSON.parse(body);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          JSON.stringify({
            message: 'Error on JSON parsing',
            json: body,
            error: error.message
          })
        );
        exit(1);
      }
      createCommitlintTyping(json);
      createCommitzenTyping(json);
    });
  })
  .on('error', (error) => {
    // eslint-disable-next-line no-console
    console.error(error.message);
  });
