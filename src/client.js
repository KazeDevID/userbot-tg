import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { config } from './config.js';

/**
 * @description Initializes MTProto Telegram client instance
 * @returns {TelegramClient}
 */
export function createTelegramClient() {
  if (!config.apiId || !config.apiHash) {
    throw new Error('API_ID and API_HASH must be specified in environment variables.');
  }

  const session = new StringSession(config.stringSession || '');

  return new TelegramClient(session, config.apiId, config.apiHash, {
    connectionRetries: 5,
    useWSS: false,
    autoReconnect: true,
    deviceModel: 'userbot-tg Engine',
    systemVersion: 'Linux x64',
    appVersion: '1.0.0'
  });
}
