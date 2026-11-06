/**
 * @typedef {Object} UserbotConfig
 * @property {number} apiId - Telegram API ID from my.telegram.org
 * @property {string} apiHash - Telegram API Hash from my.telegram.org
 * @property {string} stringSession - MTProto Session String
 * @property {string} prefix - Command prefix character
 */

/**
 * @description Application configuration reader
 * @type {UserbotConfig}
 */
export const config = {
  apiId: Number(process.env.API_ID) || 0,
  apiHash: process.env.API_HASH || '',
  stringSession: process.env.STRING_SESSION || '',
  prefix: process.env.COMMAND_PREFIX || '.'
};
