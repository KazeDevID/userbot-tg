let afkState = {
  active: false,
  reason: '',
  since: 0
};

/**
 * @param {import('../dispatcher.js').Dispatcher} dispatcher
 */
export function registerUserbotPlugin(dispatcher) {
  dispatcher.use(async (ctx, next) => {
    if (ctx.isOutgoing && afkState.active && ctx.command !== 'afk') {
      afkState.active = false;
      const durationSeconds = Math.floor((Date.now() - afkState.since) / 1000);
      const notice = await ctx.reply('👋 **Back Online!**\nAFK status cleared after `' + durationSeconds + 's`.');
      setTimeout(() => {
        notice.delete({ revoke: true }).catch(() => null);
      }, 5000);
    }

    if (!ctx.isOutgoing && afkState.active) {
      const isPrivate = ctx.event.isPrivate;
      const isMentioned = ctx.event.message.mentioned;

      if (isPrivate || isMentioned) {
        const timeAgo = Math.floor((Date.now() - afkState.since) / 1000);
        await ctx.reply([
          '💤 **Owner is currently AFK**',
          '• **Reason:** ' + (afkState.reason || 'Away from keyboard'),
          '• **Since:** `' + timeAgo + ' seconds ago`'
        ].join('\n'));
      }
    }

    await next();
  });

  dispatcher.registerCommand(['afk'], async (ctx) => {
    const reason = ctx.query || 'Away from keyboard';
    afkState = {
      active: true,
      reason,
      since: Date.now()
    };

    await ctx.edit('🌙 **AFK Mode Activated**\n• **Reason:** ' + reason);
  }, {
    description: 'Sets Away-From-Keyboard status with auto-reply on mentions and PMs',
    usage: '[reason]',
    category: 'Userbot'
  });

  dispatcher.registerCommand(['unafk'], async (ctx) => {
    afkState.active = false;
    await ctx.edit('☀️ **AFK Mode Deactivated**');
  }, {
    description: 'Manually disables AFK mode',
    category: 'Userbot'
  });

  dispatcher.registerCommand(['type'], async (ctx) => {
    if (!ctx.query) {
      await ctx.edit('Usage: .type <text to animate>');
      return;
    }

    const targetText = ctx.query;
    let accumulated = '';
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let i = 0; i < targetText.length; i++) {
      accumulated += targetText[i];
      if (i % 2 === 0 || i === targetText.length - 1) {
        await ctx.edit(accumulated + '▌').catch(() => null);
        await delay(120);
      }
    }

    await ctx.edit(targetText).catch(() => null);
  }, {
    description: 'Animates a typewriter effect for the message text',
    usage: '<text>',
    category: 'Userbot'
  });

  dispatcher.registerCommand(['whois'], async (ctx) => {
    const reply = await ctx.message.getReplyMessage();
    if (!reply || !reply.senderId) {
      await ctx.edit('Please reply to a user message with .whois');
      return;
    }

    try {
      const entity = await ctx.client.getEntity(reply.senderId);
      const fullName = ((entity.firstName || '') + ' ' + (entity.lastName || '')).trim();

      const profile = [
        '👤 **Telegram User Profile**',
        '• **Full Name:** ' + (fullName || 'N/A'),
        '• **User ID:** `' + entity.id + '`',
        '• **Username:** @' + (entity.username || 'none'),
        '• **Is Bot:** ' + (entity.bot ? 'Yes' : 'No'),
        '• **Verified:** ' + (entity.verified ? 'Yes' : 'No')
      ].join('\n');

      await ctx.edit(profile);
    } catch (err) {
      await ctx.edit('⚠️ Failed to fetch user info: ' + err.message);
    }
  }, {
    description: 'Inspects user account metadata of replied message',
    category: 'Userbot'
  });

  dispatcher.registerCommand(['block'], async (ctx) => {
    const reply = await ctx.message.getReplyMessage();
    if (!reply || !reply.senderId) {
      await ctx.edit('Please reply to a user to block them.');
      return;
    }

    try {
      const entity = await ctx.client.getEntity(reply.senderId);
      await ctx.client.blockUser(entity);
      await ctx.edit('🚫 User `' + reply.senderId + '` has been blocked.');
    } catch (err) {
      await ctx.edit('⚠️ Block failed: ' + err.message);
    }
  }, {
    description: 'Blocks the replied user',
    category: 'Userbot'
  });
}
