/**
 * @param {number} seconds
 * @returns {string} Formatted duration
 */
function formatDuration(seconds) {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const segments = [];
  if (d > 0) segments.push(d + 'd');
  if (h > 0) segments.push(h + 'h');
  if (m > 0) segments.push(m + 'm');
  segments.push(s + 's');
  return segments.join(' ');
}

/**
 * @param {import('../dispatcher.js').Dispatcher} dispatcher
 */
export function registerSystemPlugin(dispatcher) {
  dispatcher.registerCommand(['ping', 'p'], async (ctx) => {
    const start = Date.now();
    await ctx.edit('Pinging MTProto DC...');
    const elapsed = Date.now() - start;

    const report = [
      '⚡ **userbot-tg Response**',
      '• **Editing Latency:** `' + elapsed + ' ms`',
      '• **Process Uptime:** `' + formatDuration(process.uptime()) + '`',
      '• **Memory Usage:** `' + (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2) + ' MB`',
      '• **Protocol:** Telegram MTProto Native'
    ].join('\n');

    await ctx.edit(report);
  }, {
    description: 'Measures account editing latency and system diagnostics',
    category: 'System'
  });

  dispatcher.registerCommand(['alive'], async (ctx) => {
    const me = await ctx.client.getMe();
    const name = ((me.firstName || '') + ' ' + (me.lastName || '')).trim();

    const banner = [
      '⚡ **userbot-tg — Telegram Selfbot Engine**',
      'Transforms personal account into automated MTProto userbot.',
      '',
      '• **Account Name:** ' + name,
      '• **Account ID:** `' + me.id + '`',
      '• **Username:** @' + (me.username || 'none'),
      '• **Runtime:** Node.js ' + process.version,
      '• **Platform:** ' + process.platform + ' ' + process.arch,
      '',
      'GitHub: https://github.com/KazeDevID/userbot-tg'
    ].join('\n');

    await ctx.edit(banner);
  }, {
    description: 'Displays userbot status banner and account credentials',
    category: 'System'
  });

  dispatcher.registerCommand(['uptime'], async (ctx) => {
    const duration = formatDuration(process.uptime());
    await ctx.edit('⏱️ **Userbot Uptime:** `' + duration + '`');
  }, {
    description: 'Checks how long the selfbot has been running',
    category: 'System'
  });

  dispatcher.registerCommand(['info'], async (ctx) => {
    const infoText = [
      'ℹ️ **userbot-tg Architecture**',
      '• **Library:** GramJS Native MTProto',
      '• **Connection:** Direct TCP/WSS to Telegram Datacenters',
      '• **Webhooks:** Disabled (None)',
      '• **Format:** Modern JavaScript ES Modules'
    ].join('\n');

    await ctx.edit(infoText);
  }, {
    description: 'Technical engine information',
    category: 'System'
  });
}
