# @hauses/flags-cli

CLI tool for Flags SDK to generate TypeScript type definitions from your feature flags.

🌐 **Website:** [flags.hauses.dev](https://flags.hauses.dev)

## Installation

```bash
npm install -D @hauses/flags-cli
# or
yarn add -D @hauses/flags-cli
# or
pnpm add -D @hauses/flags-cli
# or
bun add -D @hauses/flags-cli
```

## Features

- 🎯 **Type-safe** - Generate TypeScript definitions for your flags
- ⚡ **Fast** - Quick flag fetching and type generation
- 🔐 **Secure** - Multiple ways to provide API keys
- 📝 **Simple** - One command to sync your flags
- 🔄 **CI-friendly** - Works great in CI/CD pipelines

## Quick Start

### 1. Add script to package.json

```json
{
  "scripts": {
    "flags:pull": "flags-cli pull --env VITE_FLAGS_KEY --out src/flags.d.ts"
  }
}
```

### 2. Run the command

```bash
npm run flags:pull
```

This generates a `flags.d.ts` file with type definitions for all your flags.

## Usage

### Basic Command

```bash
flags-cli pull [options]
```

### Options

- `-k, --key <key>` - Publishable key (supports `$VARIABLE` syntax)
- `-e, --env <variable>` - Environment variable name containing the key
- `-o, --out <path>` - Output file path (default: `./flags.d.ts`)
- `-V, --version` - Output the version number
- `-h, --help` - Display help information

## Examples

### Using Environment Variable Name

```bash
flags-cli pull --env VITE_FLAGS_KEY
```

This reads the key from the `VITE_FLAGS_KEY` environment variable.

### Using $ Syntax

```bash
flags-cli pull --key $VITE_FLAGS_KEY
```

This also reads from the `VITE_FLAGS_KEY` environment variable.

### Direct Key

```bash
flags-cli pull --key pk_123456789
```

⚠️ **Not recommended for production** - Use environment variables instead.

### Custom Output Path

```bash
flags-cli pull --env FLAGS_KEY --out types/flags.d.ts
```

### Multiple Commands

```json
{
  "scripts": {
    "flags:dev": "flags-cli pull --env VITE_FLAGS_DEV_KEY --out src/flags.d.ts",
    "flags:prod": "flags-cli pull --env VITE_FLAGS_PROD_KEY --out src/flags.d.ts"
  }
}
```

## Generated Output

The CLI generates a TypeScript declaration file that extends the SDK types:

```typescript
import "react-sdk";

declare module "react-sdk" {
  export interface FlagValues {
    "dark-mode": boolean;
    "new-dashboard": boolean;
    "beta-features": boolean;
    "experimental-ui": boolean;
  }
}
```

This provides autocomplete and type checking in your IDE:

```tsx
import { useFlags } from '@hauses/react-sdk';

// ✅ TypeScript knows about these flags
useFlags('dark-mode');
useFlags('new-dashboard');

// ❌ TypeScript error - flag doesn't exist
useFlags('unknown-flag');
```

## Framework Integration

### Vite

```json
{
  "scripts": {
    "flags:pull": "flags-cli pull --env VITE_FLAGS_KEY"
  }
}
```

```env
VITE_FLAGS_KEY=pk_your_key_here
```

### Create React App

```json
{
  "scripts": {
    "flags:pull": "flags-cli pull --env REACT_APP_FLAGS_KEY"
  }
}
```

```env
REACT_APP_FLAGS_KEY=pk_your_key_here
```

### Next.js

```json
{
  "scripts": {
    "flags:pull": "flags-cli pull --env NEXT_PUBLIC_FLAGS_KEY"
  }
}
```

```env
NEXT_PUBLIC_FLAGS_KEY=pk_your_key_here
```

### Remix

```json
{
  "scripts": {
    "flags:pull": "flags-cli pull --env VITE_FLAGS_KEY"
  }
}
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Update Flag Types

on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
  workflow_dispatch:

jobs:
  update-flags:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run flags:pull
        env:
          VITE_FLAGS_KEY: ${{ secrets.FLAGS_KEY }}
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: update flag types'
          title: 'Update feature flag types'
          branch: update-flags
```

### GitLab CI

```yaml
update-flags:
  stage: update
  script:
    - npm install
    - npm run flags:pull
  artifacts:
    paths:
      - src/flags.d.ts
  only:
    - schedules
```

### Pre-commit Hook

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run flags:pull && git add src/flags.d.ts"
    }
  }
}
```

## Development Workflow

### 1. Create flags in dashboard

Go to [flags.hauses.dev](https://flags.hauses.dev) and create your flags.

### 2. Pull types locally

```bash
npm run flags:pull
```

### 3. Use flags with type safety

```tsx
const myFlag = useFlags('my-new-flag'); // Autocomplete works!
```

### 4. Commit the generated file

```bash
git add src/flags.d.ts
git commit -m "chore: update flag types"
```

## Best Practices

### 1. Run before build

```json
{
  "scripts": {
    "prebuild": "npm run flags:pull",
    "build": "vite build"
  }
}
```

### 2. Use environment variables

```bash
# ✅ Good
flags-cli pull --env VITE_FLAGS_KEY

# ❌ Bad - exposes key in command history
flags-cli pull --key pk_123456789
```

### 3. Add to .gitignore (optional)

If you prefer to generate types locally only:

```gitignore
# .gitignore
src/flags.d.ts
```

Or commit it for team consistency:

```bash
# Keep flags.d.ts in version control
git add src/flags.d.ts
```

### 4. Set up CI/CD

Automate flag type updates with scheduled workflows.

## Troubleshooting

### Error: Environment variable not set

```bash
❌ Error: Environment variable VITE_FLAGS_KEY is not set.
```

**Solution:** Make sure the environment variable exists:

```bash
echo $VITE_FLAGS_KEY
```

### Error: Publishable Key is missing

```bash
❌ Error: Publishable Key is missing.
```

**Solution:** Provide the key using one of these methods:

```bash
flags-cli pull --key pk_123
flags-cli pull --env FLAGS_KEY
flags-cli pull --key $FLAGS_KEY
```

### Error: Failed to fetch flags

```bash
❌ Error generating types: Failed to fetch flags: 401 Unauthorized
```

**Solution:** Check that your publishable key is valid and has the correct permissions.

### Warning: No flags found

```bash
Warning: No flags found.
✅ Successfully generated types at ./flags.d.ts
Found 0 flags:
```

**Solution:** Create some flags in your dashboard at [flags.hauses.dev](https://flags.hauses.dev).

## API

### Command: `pull`

Fetches flags from the API and generates TypeScript definitions.

```bash
flags-cli pull [options]
```

**Options:**

| Option | Alias | Description | Required | Default |
|--------|-------|-------------|----------|---------|
| `--key <key>` | `-k` | Publishable key | Yes* | - |
| `--env <variable>` | `-e` | Environment variable name | Yes* | - |
| `--out <path>` | `-o` | Output file path | No | `./flags.d.ts` |

\* Either `--key` or `--env` is required

## Version

Check the CLI version:

```bash
flags-cli --version
```

## Help

Display help information:

```bash
flags-cli --help
flags-cli pull --help
```

## Related Packages

- [@hauses/flags-core](https://www.npmjs.com/package/@hauses/flags-core) - Core SDK
- [@hauses/react-sdk](https://www.npmjs.com/package/@hauses/react-sdk) - React SDK

## License

MIT

## Support

- 📧 Email: jordi.casas004@gmail.com
- 🌐 Website: [flags.hauses.dev](https://flags.hauses.dev)
- 📖 Documentation: [flags.hauses.dev/docs](https://flags.hauses.dev/docs)
- 🐛 Issues: [GitHub Issues](https://github.com/JordiCasasPla/flags-sdk/issues)

---

Part of the [Flags SDK](https://github.com/JordiCasasPla/flags-sdk) monorepo.