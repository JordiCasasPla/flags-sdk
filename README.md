# Flags SDK

A lightweight, type-safe feature flags SDK for JavaScript and React applications. Manage feature flags with real-time updates and powerful targeting capabilities.

🌐 **Website:** [flags.hauses.dev](https://flags.hauses.dev)

## Features

- 🎯 **Type-safe** - Full TypeScript support with auto-generated flag types
- ⚡ **Lightweight** - Minimal bundle size with zero dependencies (core)
- 🔄 **Real-time** - Instant flag updates without redeployment
- 🎨 **React hooks** - Built-in React integration with `useFlags` hook
- 👥 **User & company targeting** - Target flags based on user or company context
- 📊 **Event tracking** - Automatic flag access tracking and analytics
- 🚀 **Easy setup** - Get started in minutes with CLI tooling

## Packages

This monorepo contains three packages:

- **`flags-core`** - Core SDK for vanilla JavaScript/TypeScript
- **`react-sdk`** - React-specific hooks and components
- **`flags-cli`** - CLI tool for generating type definitions

## Installation

### React Application

```bash
npm install react-sdk flags-cli
# or
yarn add react-sdk flags-cli
# or
pnpm add react-sdk flags-cli
# or
bun add react-sdk flags-cli
```

### Vanilla JavaScript/TypeScript

```bash
npm install flags-core
# or
yarn add flags-core
# or
pnpm add flags-core
# or
bun add flags-core
```

## Quick Start

### 1. Get your Publishable Key

Sign up at [flags.hauses.dev](https://flags.hauses.dev) and get your publishable key from the dashboard.

### 2. Set up your environment

Create a `.env` file in your project root:

```env
VITE_FLAGS_PUBLISHABLE_KEY=your_publishable_key_here
```

### 3. Generate type definitions (Optional but recommended)

Add a script to your `package.json`:

```json
{
  "scripts": {
    "flags:pull": "flags-cli pull --env VITE_FLAGS_PUBLISHABLE_KEY --out src/flags.d.ts"
  }
}
```

Run the CLI to generate types:

```bash
npm run flags:pull
```

This creates a `flags.d.ts` file with all your flag keys for autocomplete and type safety.

### 4. Use in your React app

```tsx
import React from 'react';
import { FlagsProvider, useFlags } from 'react-sdk';

function App() {
  return (
    <FlagsProvider
      publishableKey={import.meta.env.VITE_FLAGS_PUBLISHABLE_KEY}
      context={{
        user: {
          key: 'user-123',
          email: 'user@example.com',
          name: 'John Doe'
        },
        company: {
          key: 'company-456',
          name: 'Acme Inc'
        }
      }}
    >
      <YourApp />
    </FlagsProvider>
  );
}

function YourApp() {
  const newFeature = useFlags('new-feature');

  if (newFeature.isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {newFeature.isEnabled ? (
        <NewFeatureComponent />
      ) : (
        <OldFeatureComponent />
      )}
    </div>
  );
}
```

### 5. Use with Vanilla JavaScript

```typescript
import { FlagsClient } from 'flags-core';

const client = new FlagsClient(
  'your_publishable_key',
  {
    user: {
      key: 'user-123',
      email: 'user@example.com'
    }
  }
);

await client.initialize();

const isEnabled = client.getFlag('new-feature');

if (isEnabled) {
  console.log('New feature is enabled!');
}
```

## API Reference

### React SDK

#### `<FlagsProvider>`

Wrap your app with the `FlagsProvider` to make flags available throughout your component tree.

```tsx
<FlagsProvider
  publishableKey="your_key"
  context={{
    user: { key: 'user-id', email: 'user@example.com' },
    company: { key: 'company-id', name: 'Company Name' }
  }}
  options={{
    baseUrl: 'https://flags.hauses.dev/api', // optional
    credentials: 'include' // optional
  }}
>
  {children}
</FlagsProvider>
```

**Props:**
- `publishableKey` (string, required) - Your publishable key from flags.hauses.dev
- `context` (object, optional) - User and company context for targeting
- `options` (object, optional) - HTTP client configuration options

#### `useFlags(key)`

Hook to check if a flag is enabled.

```tsx
const { isEnabled, isLoading } = useFlags('feature-key');
```

**Returns:**
- `isEnabled` (boolean) - Whether the flag is enabled
- `isLoading` (boolean) - Whether flags are still loading

### Core SDK

#### `FlagsClient`

Main client for interacting with the Flags API.

```typescript
const client = new FlagsClient(publishableKey, context, options);
```

**Methods:**

- `initialize()` - Initialize the client and fetch flags
- `getFlag(key: string): boolean` - Get flag value by key
- `getFlags(): RawFlags` - Get all flags
- `setContext(context: FlagsContext)` - Update the context
- `isInitialized(): boolean` - Check if client is initialized

### CLI

#### `flags-cli pull`

Generate TypeScript type definitions for your flags.

```bash
flags-cli pull [options]
```

**Options:**

- `-k, --key <key>` - Publishable key (can use `$VARIABLE` syntax)
- `-e, --env <variable>` - Environment variable name containing the key
- `-o, --out <path>` - Output file path (default: `./flags.d.ts`)

**Examples:**

```bash
# Using environment variable
flags-cli pull --env VITE_FLAGS_PUBLISHABLE_KEY

# Using key directly
flags-cli pull --key pk_123456789

# Using $VARIABLE syntax
flags-cli pull --key $VITE_FLAGS_PUBLISHABLE_KEY

# Custom output path
flags-cli pull --env FLAGS_KEY --out types/flags.d.ts
```

## Context & Targeting

The SDK supports user and company context for advanced targeting:

```typescript
interface FlagsContext {
  user?: {
    key: string;          // required
    name?: string;        // optional
    email?: string;       // optional
  };
  company?: {
    key: string;          // required
    name?: string;        // optional
  };
}
```

Update context dynamically:

```tsx
<FlagsProvider
  publishableKey={key}
  context={userContext} // Will update when this prop changes
>
  {children}
</FlagsProvider>
```

## Event Tracking

The SDK automatically tracks flag access events for analytics. Events are rate-limited to prevent excessive API calls.

## Rate Limiting

Built-in rate limiting prevents excessive API calls:
- Flag fetches are limited
- Event tracking is rate-limited per flag
- All limits are configurable via the API dashboard

## TypeScript Support

Generate type-safe flag definitions:

```bash
npm run flags:pull
```

This creates a `flags.d.ts` file:

```typescript
import "react-sdk";

declare module "react-sdk" {
  export interface FlagValues {
    "new-feature": boolean;
    "beta-ui": boolean;
    "dark-mode": boolean;
  }
}
```

Now you get autocomplete and type checking:

```tsx
// ✅ TypeScript knows about these flags
useFlags('new-feature');
useFlags('beta-ui');

// ❌ TypeScript error - flag doesn't exist
useFlags('unknown-flag');
```

## Examples

Check out the [examples](./examples) directory:

- [React + Vite](./examples/react-vite) - Full React example with Vite

## Development

This project uses Bun as the runtime and package manager.

```bash
# Install dependencies
bun install

# Run tests
bun test

# Build all packages
cd packages/flags-core && bun run build
cd packages/react-sdk && bun run build
cd packages/cli && bun run build

# Lint
bun run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

- 📧 Email: jordi.casas004@gmail.com
- 🌐 Website: [flags.hauses.dev](https://flags.hauses.dev)
- 📖 Documentation: [flags.hauses.dev/docs](https://flags.hauses.dev/docs)
- 🐛 Issues: [GitHub Issues](https://github.com/JordiCasasPla/flags-sdk/issues)

---

Made with ❤️ by [Jordi Casas](https://github.com/JordiCasasPla)