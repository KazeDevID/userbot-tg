/**
 * @param {import('../dispatcher.js').Dispatcher} dispatcher
 */
export function registerChatPlugin(dispatcher) {
  dispatcher.registerCommand(['purge'], async (ctx) => {
    const count = Math.min(Math.max(Number(ctx.args[0]) || 10, 1), 100);
    const messages = await ctx.client.getMessages(ctx.chatId, { limit: count + 1 });

    const toDelete = messages.filter((m) => m.out === true).map((m) => m.id);

    if (toDelete.length > 0) {
      await ctx.client.deleteMessages(ctx.chatId, toDelete, { revoke: true });
    }

    const status = await ctx.client.sendMessage(ctx.chatId, {
      message: '🧹 **Purged ' + toDelete.length + ' outgoing messages.**',
      parseMode: 'md'
    });

    setTimeout(() => {
      status.delete({ revoke: true }).catch(() => null);
    }, 4000);
  }, {
    description: 'Deletes your recent outgoing messages in current chat',
    usage: '[count 1-100]',
    category: 'Chat'
  });

  dispatcher.registerCommand(['del', 'd'], async (ctx) => {
    const reply = await ctx.message.getReplyMessage();
    if (!reply) {
      await ctx.edit('Reply to a message to delete it.');
      return;
    }

    await reply.delete({ revoke: true });
    await ctx.deleteMsg();
  }, {
    description: 'Deletes the replied message and trigger command',
    category: 'Chat'
  });

  dispatcher.registerCommand(['pin'], async (ctx) => {
    const reply = await ctx.message.getReplyMessage();
    if (!reply) {
      await ctx.edit('Reply to the message you wish to pin.');
      return;
    }

    await ctx.client.pinMessage(ctx.chatId, reply.id, { notify: false });
    await ctx.edit('📌 **Message pinned successfully.**');
  }, {
    description: 'Pins the replied message silently',
    category: 'Chat'
  });

  dispatcher.registerCommand(['tagall'], async (ctx) => {
    const announcement = ctx.query || 'Attention everyone!';
    const participants = await ctx.client.getParticipants(ctx.chatId, { limit: 50 }).catch(() => []);

    if (!participants.length) {
      await ctx.edit('⚠️ Could not retrieve participants or not in a group chat.');
      return;
    }

    const mentions = participants
      .filter((u) => !u.bot)
      .slice(0, 30)
      .map((u) => '[' + (u.firstName || 'User') + '](tg://user?id=' + u.id + ')')
      .join(' ');

    await ctx.edit('📢 **' + announcement + '**\n\n' + mentions);
  }, {
    description: 'Tags participants in the group with an announcement',
    usage: '[announcement]',
    category: 'Chat'
  });
}
