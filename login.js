import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';

/**
 * @description Interactive terminal session generator for Telegram MTProto
 */
async function generateSession() {
  console.log('====================================================');
  console.log('  userbot-tg — Telegram MTProto Session Generator');
  console.log('  Obtain API_ID and API_HASH from https://my.telegram.org');
  console.log('====================================================');

  const apiIdStr = await input.text('Enter your API_ID: ');
  const apiId = Number(apiIdStr.trim());
  const apiHash = (await input.text('Enter your API_HASH: ')).trim();

  if (!apiId || !apiHash) {
    console.error('API_ID and API_HASH are mandatory.');
    process.exit(1);
  }

  const stringSession = new StringSession('');
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5
  });

  await client.start({
    phoneNumber: async () => await input.text('Enter phone number (+country code): '),
    password: async () => await input.password('Enter 2FA password (leave empty if none): '),
    phoneCode: async () => await input.text('Enter Telegram login verification code: '),
    onError: (err) => console.error('Authentication error:', err.message)
  });

  console.log('\n[userbot-tg] Authentication successful!');
  const sessionToken = client.session.save();

  console.log('\n==================== YOUR STRING_SESSION ====================');
  console.log(sessionToken);
  console.log('=============================================================\n');
  console.log('Copy this STRING_SESSION into your .env file:');
  console.log('STRING_SESSION=' + sessionToken);

  await client.disconnect();
  process.exit(0);
}

generateSession().catch((err) => {
  console.error('[userbot-tg Login Error]:', err.message);
  process.exit(1);
});
