/**
 * Notifier - surfaces events to the human operator.
 *
 * The killer case is blocked tasks: when registration hits a CAPTCHA/phone
 * step, or half-auto content needs approval, the operator must be told
 * immediately. Channels are pluggable; desktop is always on, Telegram is
 * enabled when a bot token + chat id are configured.
 */
import notifier from 'node-notifier';
import { getDatabase } from '../../storage/database.js';
import { createLogger } from '../../utils/logger.js';
const logger = createLogger('notifier');
// ---- Desktop channel (node-notifier) --------------------------------------
class DesktopChannel {
    name = 'desktop';
    isEnabled() {
        return true;
    }
    async send(title, message) {
        await new Promise(resolve => {
            notifier.notify({ title: `UnMarket · ${title}`, message, wait: false }, () => resolve());
        });
    }
}
// ---- Telegram channel ------------------------------------------------------
class TelegramChannel {
    name = 'telegram';
    settings() {
        const db = getDatabase();
        const get = (key) => {
            const row = db.prepare('SELECT value FROM session_state WHERE key = ?').get(key);
            return row?.value;
        };
        return { token: get('notify_telegram_token'), chatId: get('notify_telegram_chat') };
    }
    isEnabled() {
        const { token, chatId } = this.settings();
        return !!token && !!chatId;
    }
    async send(title, message) {
        const { token, chatId } = this.settings();
        if (!token || !chatId)
            return;
        const text = `*${title}*\n${message}`;
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
        });
        if (!res.ok) {
            logger.warn('Telegram notify failed', { status: res.status });
        }
    }
}
export class Notifier {
    channels = [new DesktopChannel(), new TelegramChannel()];
    /** Add a custom channel (e.g. email, webhook). */
    addChannel(channel) {
        this.channels.push(channel);
    }
    /** Broadcast a message to every enabled channel. */
    async notify(title, message, level = 'info') {
        logger[level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'info'](`notify: ${title}`, { message });
        await Promise.all(this.channels
            .filter(c => c.isEnabled())
            .map(c => c.send(title, message, level).catch(err => logger.warn('Channel send failed', { channel: c.name, err: String(err) }))));
    }
    /** Notify that a task is blocked and needs a human to act. */
    async notifyBlocked(task) {
        const reason = task.blockedReason ?? 'unknown';
        const what = `${task.type} on ${task.platform ?? '—'}`;
        await this.notify('需要人工介入', `任务 ${what} 被阻塞：${reason}\n任务ID: ${task.id}\n` +
            `完成后运行: unmarket task unblock ${task.id}`, 'warn');
    }
    /** Configure Telegram notifications. */
    configureTelegram(token, chatId) {
        const db = getDatabase();
        const upsert = db.prepare(`
      INSERT OR REPLACE INTO session_state (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
    `);
        upsert.run('notify_telegram_token', token);
        upsert.run('notify_telegram_chat', chatId);
        logger.info('Telegram notifications configured');
    }
}
let instance = null;
export function getNotifier() {
    if (!instance)
        instance = new Notifier();
    return instance;
}
//# sourceMappingURL=notifier.js.map