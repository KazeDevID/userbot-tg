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
      categories.get(cat).push({ name, usage: meta.usage || '' });
    }

    const lines = [
      '⚡ **userbot-tg Menu**',
      'Native Telegram MTProto Automation',
      '',
      '**📁 Developer (Prefixless)**',
      '• `> <code>`',
      '• `$ <cmd>`',
      ''
    ];

    for (const [category, cmds] of categories.entries()) {
      lines.push('**📁 ' + category + '**');
      const seen = new Set();
      for (const { name, usage } of cmds) {
        if (seen.has(name)) continue;
        seen.add(name);
        const useStr = usage ? (' ' + usage) : '';
        lines.push('• `.' + name + useStr + '`');
      }
      lines.push('');
    }

    lines.push('GitHub: https://github.com/KazeDevID/userbot-tg');

    await ctx.edit(lines.join('\n'));
  }, {
    category: 'General'
  });
}
