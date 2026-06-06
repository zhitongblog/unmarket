import type { Task } from '../task/types.js';
export type NotifyLevel = 'info' | 'warn' | 'error';
export interface NotifyChannel {
    readonly name: string;
    isEnabled(): boolean;
    send(title: string, message: string, level: NotifyLevel): Promise<void>;
}
export declare class Notifier {
    private channels;
    /** Add a custom channel (e.g. email, webhook). */
    addChannel(channel: NotifyChannel): void;
    /** Broadcast a message to every enabled channel. */
    notify(title: string, message: string, level?: NotifyLevel): Promise<void>;
    /** Notify that a task is blocked and needs a human to act. */
    notifyBlocked(task: Task): Promise<void>;
    /** Configure Telegram notifications. */
    configureTelegram(token: string, chatId: string): void;
}
export declare function getNotifier(): Notifier;
//# sourceMappingURL=notifier.d.ts.map