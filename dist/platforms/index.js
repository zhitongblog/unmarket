/**
 * Platform registry bootstrap.
 *
 * Importing this module registers every available platform adapter.
 * The executor imports this once at startup so getPlatformRegistry()
 * is fully populated. Add new platforms by importing them here.
 */
import './twitter/index.js';
// import './reddit/index.js';     // (next)
// import './linkedin/index.js';   // (next)
export { getPlatformRegistry } from './platform.js';
//# sourceMappingURL=index.js.map