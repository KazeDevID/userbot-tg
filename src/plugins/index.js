import { registerDeveloperPlugin } from './developer.js';
import { registerSystemPlugin } from './system.js';
import { registerUserbotPlugin } from './userbot.js';
import { registerChatPlugin } from './chat.js';
import { registerToolsPlugin } from './tools.js';

/**
 * @param {import('../dispatcher.js').Dispatcher} dispatcher
 */
export function registerAllPlugins(dispatcher) {
  registerDeveloperPlugin(dispatcher);
  registerSystemPlugin(dispatcher);
  registerUserbotPlugin(dispatcher);
  registerChatPlugin(dispatcher);
  registerToolsPlugin(dispatcher);

  dispatcher.registerCommand(['help', 'menu'], async (ctx) => {
    const categories = new Map();

    for (const [name, meta] of dispatcher.commandMeta.entries()) {
      const cat = meta.category || 'General';
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat).push({ name, meta });
    }

    const lines = [
      '⚡ **userbot-tg Commands**',
      'Native Telegram MTProto Automation',
      'Prefix: .',
      ''
    ];

    for (const [category, cmds] of categories.entries()) {
      lines.push('**📁 ' + category + '**');
      for (const { name, meta } of cmds) {
        const usage = meta.usage ? (' ' + meta.usage) : '';
        lines.push('• `.' + name + usage + '` — ' + meta.description);
      }
      lines.push('');
    }

    lines.push('GitHub: https://github.com/KazeDevID/userbot-tg');

    await ctx.edit(lines.join('\n'));
  }, {
    description: 'Displays the command list and usage help',
    category: 'General'
  });
}
