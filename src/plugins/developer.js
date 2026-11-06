import { exec as cpExec } from 'node:child_process';
import util from 'node:util';

/**
 * @param {import('../dispatcher.js').Dispatcher} dispatcher
 */
export function registerDeveloperPlugin(dispatcher) {
  dispatcher.registerCommand(['eval', 'e'], async (ctx) => {
    if (!ctx.query) return;

    try {
      const evalFn = Function(
        'ctx',
        'client',
        'event',
        'message',
        '"use strict"; return (async () => { return ' + ctx.query + '; })();'
      );
      const evaluated = await evalFn(ctx, ctx.client, ctx.event, ctx.message);

      let text = '';
      if (typeof evaluated === 'object' && evaluated !== null) {
        text = util.inspect(evaluated, { depth: 1, maxArrayLength: 50 });
      } else {
        text = String(evaluated);
      }

      await ctx.edit(text.slice(0, 4000));
    } catch (err) {
      await ctx.edit(err.stack || err.message || String(err));
    }
  }, {
    description: 'Evaluates JavaScript with direct output',
    usage: '<code>',
    category: 'Developer'
  });

  dispatcher.registerCommand(['exec', 'ex', 'sh'], async (ctx) => {
    if (!ctx.query) return;

    cpExec(ctx.query, { timeout: 30000, maxBuffer: 1024 * 1024 }, async (error, stdout, stderr) => {
      const raw = stdout || stderr || (error ? error.message : '');
      const trimmed = raw.trim();
      if (trimmed) {
        await ctx.edit(trimmed.slice(0, 4000));
      } else {
        await ctx.edit('done');
      }
    });
  }, {
    description: 'Executes shell command with direct output',
    usage: '<command>',
    category: 'Developer'
  });
}
