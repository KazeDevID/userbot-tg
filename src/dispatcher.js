import { NewMessage } from 'telegram/events/index.js';
import { config } from './config.js';

/**
 * @typedef {Object} CommandContext
 * @property {import('telegram/events/NewMessage').NewMessageEvent} event
 * @property {import('telegram').TelegramClient} client
 * @property {string} command
 * @property {string[]} args
 * @property {string} query
 * @property {number} senderId
 * @property {number|bigint} chatId
 * @property {boolean} isOutgoing
 * @property {(text: string, options?: Object) => Promise<void>} edit
 * @property {(text: string, options?: Object) => Promise<void>} reply
 * @property {() => Promise<void>} deleteMsg
 */

/**
 * @class Dispatcher
 * @description Central event and command router for Telegram Userbot
 */
export class Dispatcher {
  /**
   * @param {import('telegram').TelegramClient} client
   */
  constructor(client) {
    this.client = client;
    this.commands = new Map();
    this.commandMeta = new Map();
    this.middlewares = [];
    this.ownerId = null;
  }

  /**
   * @param {number} id
   */
  setOwnerId(id) {
    this.ownerId = id;
  }

  /**
   * @param {(ctx: CommandContext, next: () => Promise<void>) => Promise<void>} fn
   * @returns {this}
   */
  use(fn) {
    this.middlewares.push(fn);
    return this;
  }

  /**
   * @param {string|string[]} name
   * @param {(ctx: CommandContext) => Promise<void>} handler
   * @param {Object} [meta={}]
   * @returns {this}
   */
  registerCommand(name, handler, meta = {}) {
    const list = Array.isArray(name) ? name : [name];
    for (const item of list) {
      const clean = item.toLowerCase().replace(/^[./!]/, '');
      this.commands.set(clean, handler);
      this.commandMeta.set(clean, {
        name: clean,
        description: meta.description || 'No description',
        usage: meta.usage || '',
        category: meta.category || 'General'
      });
    }
    return this;
  }

  /**
   * @description Starts listening to outgoing commands and incoming messages
   */
  listen() {
    this.client.addEventHandler(async (event) => {
      await this.handleEvent(event);
    }, new NewMessage({}));
  }

  /**
   * @param {import('telegram/events/NewMessage').NewMessageEvent} event
   */
  async handleEvent(event) {
    const message = event.message;
    if (!message || !message.text) return;

    const rawText = message.text.trim();
    const isOutgoing = message.out === true;
    const senderId = message.senderId ? Number(message.senderId) : 0;
    const chatId = message.chatId;

    let command = '';
    let args = [];
    let query = '';

    if (rawText.startsWith('>')) {
      const expr = rawText.slice(1).trim();
      if (expr) {
        command = 'eval';
        args = [expr];
        query = expr;
      }
    } else if (rawText.startsWith('$')) {
      const cmd = rawText.slice(1).trim();
      if (cmd) {
        command = 'exec';
        args = [cmd];
        query = cmd;
      }
    } else if (rawText.startsWith(config.prefix)) {
      const tokens = rawText.slice(config.prefix.length).trim().split(/\s+/);
      command = tokens[0]?.toLowerCase() || '';
      args = tokens.slice(1);
      query = args.join(' ');
    }

    const ctx = {
      event,
      client: this.client,
      message,
      command,
      args,
      query,
      senderId,
      chatId,
      isOutgoing,
      edit: async (text, options = {}) => {
        return message.edit({ text, parseMode: 'md', ...options });
      },
      reply: async (text, options = {}) => {
        return message.reply({ message: text, parseMode: 'md', ...options });
      },
      deleteMsg: async () => {
        return message.delete({ revoke: true });
      }
    };

    let index = -1;
    const runner = async (i) => {
      if (i <= index) throw new Error('next() called multiple times');
      index = i;
      const fn = this.middlewares[i];
      if (fn) {
        await fn(ctx, () => runner(i + 1));
      } else {
        await this.routeCommand(ctx);
      }
    };

    try {
      await runner(0);
    } catch (err) {
      console.error('[userbot-tg Dispatcher Error]:', err.message);
    }
  }

  /**
   * @param {CommandContext} ctx
   */
  async routeCommand(ctx) {
    if (!ctx.isOutgoing || !ctx.command) return;

    if (this.commands.has(ctx.command)) {
      const handler = this.commands.get(ctx.command);
      await handler(ctx);
    }
  }
}
