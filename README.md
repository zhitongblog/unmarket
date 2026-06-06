# UnMarket

Global marketing automation tool - Part of the UnzooAI product family.

Input a product URL, auto-generate multilingual content, and publish to 200+ platforms worldwide.

## Features

- **Desktop App**: Cross-platform GUI for Mac and Windows
- **CLI**: Command-line interface for automation
- **Multi-language**: Auto-translate content to 17+ languages
- **Multi-platform**: Publish to 200+ platforms worldwide
- **AI-powered**: Generate platform-optimized content

## Installation

### Desktop App

Download the latest release:
- **Windows**: `UnMarket Setup x.x.x.exe` (Installer) or `UnMarket x.x.x.exe` (Portable)
- **Mac**: `UnMarket-x.x.x.dmg`

Or build from source:

```bash
git clone <repo>
cd unmarket
npm install
npm run dist:win    # Windows
npm run dist:mac    # Mac
```

### CLI Installation

```bash
npm install -g unmarket
```

Or run locally:

```bash
git clone <repo>
cd unmarket
npm install
npm run build:cli
npm link
```

> **Note**: CLI and Desktop modes use different native module compilations. Use `npm run rebuild:node` for CLI mode or `npm run rebuild:electron` for desktop mode.

## Desktop App

The desktop app provides a visual interface for managing products, generating content, and publishing.

### Running the Desktop App

```bash
# Development mode
npm run desktop

# Or run the built app
./release/UnMarket\ x.x.x.exe  # Windows portable
```

### Desktop Features

- **Products**: Add, edit, and manage products with a visual interface
- **Publish**: Generate and preview content, publish to multiple platforms
- **Accounts**: Manage platform accounts
- **Statistics**: View publishing performance metrics
- **Settings**: Configure AI providers, browser, and scheduler

## CLI Quick Start

### 1. Add a product

**Manual creation (no browser needed):**

```bash
unmarket product create \
  --name "My Product" \
  --url "https://example.com" \
  --tagline "A great tool for developers" \
  --description "My Product helps developers build faster." \
  --type tool \
  --features "Fast,Easy to use,Open source" \
  --platforms "twitter,reddit,hackernews" \
  --languages "en,zh"
```

**Or add a demo product for testing:**

```bash
unmarket product demo
```

**Or analyze from URL (requires Unzoo browser + AI):**

```bash
unmarket analyze https://example.com --save
```

### 2. Preview content

Preview generated content without publishing:

```bash
# Using demo content (no AI needed)
unmarket preview <product-id> --demo -p "twitter,linkedin" -l "en,zh"

# Using AI (requires AI configuration)
unmarket preview <product-id> -p "twitter,linkedin"
```

### 3. Publish

**Simulate (dry run):**

```bash
unmarket publish <product-id> -n -p "twitter,reddit" -l "en"
```

**Actual publish:**

```bash
unmarket publish <product-id> -p "twitter,reddit" -l "en,zh"
```

## Configuration

### Configure AI provider

```bash
# View available AI models
unmarket ai models

# Configure AI (interactive)
unmarket ai config
```

Supported AI providers:
- Anthropic (Claude)
- OpenAI (GPT)
- Google (Gemini)
- Alibaba (Qwen)
- ByteDance (Doubao)
- DeepSeek
- Zhipu (GLM)
- Moonshot (Kimi)

### View configuration

```bash
unmarket config show
```

## Product Management

```bash
# List all products
unmarket product list

# Show product details
unmarket product show <id>

# Update product
unmarket product update <id> --priority 8 --weight 5

# Deactivate product
unmarket product deactivate <id>

# Delete product
unmarket product delete <id>
```

## Account Management

```bash
# List accounts
unmarket account list

# Auto-register account (requires Gmail setup)
unmarket gmail login
unmarket register twitter

# Add account manually
unmarket account add twitter --username myuser --password mypass
```

## Scheduler

Run automated publishing:

```bash
# Start scheduler
unmarket run --mode weighted

# With duration limit
unmarket run --mode round-robin --duration 24h
```

Scheduling modes:
- `round-robin`: Equal rotation between products
- `weighted`: More frequent posts for higher-weight products
- `priority`: Always post highest-priority products first
- `smart`: AI-optimized based on analytics

## Queue Management

```bash
# View queue
unmarket queue list

# Pause/resume queue
unmarket queue pause
unmarket queue resume

# Clear pending tasks
unmarket queue clear
```

## Statistics

```bash
# View overall stats
unmarket stats

# View product stats
unmarket stats <product-id>

# Export data
unmarket stats --export json
```

## Supported Platforms

### API-based (Free)
- Dev.to
- Hashnode
- Medium
- Discord
- Telegram
- Mastodon

### Browser-based (Requires Unzoo)
- Twitter/X
- LinkedIn
- Facebook
- Reddit
- Weibo
- Product Hunt
- Hacker News
- V2EX
- Juejin
- Qiita
- Zenn
- And 180+ more...

## Supported Languages

en, zh, ja, ko, de, fr, es, pt, ru, ar, hi, th, vi, id, tr, pl, nl

## Environment Variables

```bash
LOG_LEVEL=debug      # Enable debug logging
DEBUG=1              # Alternative debug flag
```

## License

MIT
