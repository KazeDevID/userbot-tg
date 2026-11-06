import { config } from './config.js';
import { createTelegramClient } from './client.js';
import { Dispatcher } from './dispatcher.js';
import { registerAllPlugins } from './plugins/index.js';

/**
 * @description Main application lifecycle bootstrap
 */
async function bootstrap() {
  console.log('====================================================');
  console.log('  userbot-tg — Telegram Userbot & Selfbot Engine');
  console.log('  Native MTProto Protocol (Direct Account Automation)');
  console.log('====================================================');

  if (!config.apiId || !config.apiHash || !config.stringSession) {
    console.error('Fatal: API_ID, API_HASH, or STRING_SESSION is missing.');
    console.error('Run: "npm run login" to authenticate and generate your session.');
    process.exit(1);
  }

  const client = createTelegramClient();
  const dispatcher = new Dispatcher(client);

  dispatcher.use(async (ctx, next) => {
    if (ctx.isOutgoing && ctx.command) {
      console.log('[userbot-tg] Executing: .' + ctx.command + ' in chat ' + ctx.chatId);
    }
    await next();
  });

  registerAllPlugins(dispatcher);

  console.log('[userbot-tg] Connecting to Telegram MTProto servers...');
  await client.connect();

  const me = await client.getMe();
  const fullName = ((me.firstName || '') + ' ' + (me.lastName || '')).trim();
  console.log('[userbot-tg] Logged in as: ' + fullName + ' (@' + (me.username || 'no-username') + ') [ID: ' + me.id + ']');

  dispatcher.setOwnerId(Number(me.id));
  dispatcher.listen();

  console.log('[userbot-tg] Userbot active! Send .ping or .alive in any Telegram chat.');

  process.once('SIGINT', async () => {
    console.log('\n[userbot-tg] Disconnecting...');
    await client.disconnect();
    process.exit(0);
  });

  process.once('SIGTERM', async () => {
    console.log('\n[userbot-tg] Terminating...');
    await client.disconnect();
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  console.error('[userbot-tg Fatal]:', err.message);
  process.exit(1);
});
