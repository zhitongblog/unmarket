/**
 * Platform registry bootstrap.
 *
 * Importing this module registers every available platform adapter.
 * The executor imports this once at startup so getPlatformRegistry()
 * is fully populated. Add new platforms by importing them here.
 */
import './twitter/index.js';
export { getPlatformRegistry } from './platform.js';
export type { Platform, PlatformContext, PlatformRegion, PublishContent, RegisterResult, LoginResult, NurtureResult, PublishResult, EngageResult, } from './platform.js';
//# sourceMappingURL=index.d.ts.map