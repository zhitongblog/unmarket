/**
 * Shared helpers for platform implementations: human-like pacing so we don't
 * fire actions at robotic, detectable intervals.
 */
export class BasePlatform {
    registrationLikelyBlocks = false;
    /** Sleep a random duration in [minMs, maxMs] to mimic a human. */
    async humanDelay(minMs = 800, maxMs = 2500) {
        const ms = minMs + Math.floor(Math.random() * (maxMs - minMs));
        await new Promise(r => setTimeout(r, ms));
    }
    /** Pick a random element from a list. */
    pick(items) {
        return items[Math.floor(Math.random() * items.length)];
    }
}
/**
 * Registry of all known platforms. Adapters register themselves on import;
 * the executor resolves them by name.
 */
class PlatformRegistry {
    platforms = new Map();
    register(platform) {
        this.platforms.set(platform.name.toLowerCase(), platform);
    }
    get(name) {
        return this.platforms.get(name.toLowerCase()) ?? null;
    }
    has(name) {
        return this.platforms.has(name.toLowerCase());
    }
    list() {
        return [...this.platforms.values()];
    }
    listByRegion(region) {
        return this.list().filter(p => p.region === region);
    }
}
let registry = null;
export function getPlatformRegistry() {
    if (!registry)
        registry = new PlatformRegistry();
    return registry;
}
//# sourceMappingURL=platform.js.map