/**
 * @param {string} expr
 * @returns {number}
 */
function evaluateArithmetic(expr) {
  const sanitized = expr.replace(/\s+/g, '');
  if (!/^[0-9+\-*/().%^]+$/.test(sanitized)) {
    throw new Error('Expression contains invalid characters');
  }
  const cleanExp = sanitized.replace(/\^/g, '**');
  const result = Function("'use strict'; return (" + cleanExp + ");")();
  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new Error('Yielded non-finite output');
  }
  return result;
}

/**
 * @param {import('../dispatcher.js').Dispatcher} dispatcher
 */
export function registerToolsPlugin(dispatcher) {
  dispatcher.registerCommand(['calc'], async (ctx) => {
    if (!ctx.query) {
      await ctx.edit('Usage: .calc <expression>\nExample: .calc (45 * 10) / 2');
      return;
    }

    try {
      const outcome = evaluateArithmetic(ctx.query);
      await ctx.edit('🧮 **Calculation:** `' + ctx.query + '`\n**Result:** `' + outcome + '`');
    } catch (err) {
      await ctx.edit('⚠️ Calculation error: ' + err.message);
    }
  }, {
    description: 'Calculates mathematical expressions safely',
    usage: '<expression>',
    category: 'Tools'
  });

  dispatcher.registerCommand(['b64', 'base64'], async (ctx) => {
    const mode = ctx.args[0]?.toLowerCase();
    const payload = ctx.args.slice(1).join(' ');

    if (!mode || !payload) {
      await ctx.edit('Usage:\n• .b64 enc <text>\n• .b64 dec <base64>');
      return;
    }

    if (mode === 'enc' || mode === 'encode') {
      const encoded = Buffer.from(payload, 'utf-8').toString('base64');
      await ctx.edit('🔒 **Base64 Encoded:**\n`' + encoded + '`');
      return;
    }

    if (mode === 'dec' || mode === 'decode') {
      try {
        const decoded = Buffer.from(payload, 'base64').toString('utf-8');
        await ctx.edit('🔓 **Base64 Decoded:**\n`' + decoded + '`');
      } catch {
        await ctx.edit('⚠️ Invalid Base64 payload.');
      }
      return;
    }

    await ctx.edit('Invalid subcommand. Use enc or dec.');
  }, {
    description: 'Encodes or decodes text via Base64',
    usage: '<enc|dec> <text>',
    category: 'Tools'
  });

  dispatcher.registerCommand(['quote'], async (ctx) => {
    const quotes = [
      { text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra" },
      { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
      { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
      { text: "Programs must be written for people to read, and only incidentally for machines to execute.", author: "Harold Abelson" },
      { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" }
    ];

    const pick = quotes[Math.floor(Math.random() * quotes.length)];
    await ctx.edit('💬 *"' + pick.text + '"*\n— _' + pick.author + '_');
  }, {
    description: 'Displays an inspiring programming quote',
    category: 'Tools'
  });

  dispatcher.registerCommand(['id'], async (ctx) => {
    const reply = await ctx.message.getReplyMessage();

    const lines = [
      '🔍 **Telegram ID Metadata**',
      '• **Your User ID:** `' + ctx.senderId + '`',
      '• **Current Chat ID:** `' + ctx.chatId + '`'
    ];

    if (reply) {
      lines.push('');
      lines.push('📌 **Replied Target**');
      lines.push('• **Replied User ID:** `' + (reply.senderId || 'N/A') + '`');
      lines.push('• **Replied Message ID:** `' + reply.id + '`');
    }

    await ctx.edit(lines.join('\n'));
  }, {
    description: 'Displays Telegram user ID and chat ID',
    category: 'Tools'
  });
}
