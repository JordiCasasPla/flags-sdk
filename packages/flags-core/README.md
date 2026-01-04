# @hauses/flags-core

Core SDK for feature flags in JavaScript and TypeScript applications.

🌐 **Website:** [flags.hauses.dev](https://flags.hauses.dev)

## Installation

```bash
npm install @hauses/flags-core
# or
yarn add @hauses/flags-core
# or
pnpm add @hauses/flags-core
# or
bun add @hauses/flags-core
```

## Features

- ⚡ **Lightweight** - Zero dependencies, minimal bundle size
- 🎯 **Type-safe** - Full TypeScript support
- 🔄 **Real-time** - Fetch flags dynamically without redeployment
- 👥 **Context targeting** - Target flags based on user/company context
- 📊 **Event tracking** - Automatic flag access tracking
- 🚦 **Rate limiting** - Built-in rate limiting to prevent excessive API calls

## Quick Start

```typescript
import { FlagsClient } from '@hauses/flags-core';

// Initialize the client
const client = new FlagsClient(
  'your_publishable_key',
  {
    user: {
      key: 'user-123',
      email: 'user@example.com',
      name: 'John Doe'
    },
    company: {
      key: 'company-456',
      name: 'Acme Inc'
    }
  }
);

// Initialize and fetch flags
await client.initialize();

// Check if a flag is enabled
const isEnabled = client.getFlag('new-feature');

if (isEnabled) {
  console.log('New feature is enabled!');
}

// Get all flags
const allFlags = client.getFlags();
console.log(allFlags);
```

## API Reference

### `FlagsClient`

Main client for interacting with the Flags API.

#### Constructor

```typescript
new FlagsClient(publishableKey: string, context?: FlagsContext, options?: HttpClientOptions)
```

**Parameters:**

- `publishableKey` (string) - Your publishable key from flags.hauses.dev
- `context` (object, optional) - User and company context for targeting
- `options` (object, optional) - HTTP client configuration

**Example:**

```typescript
const client = new FlagsClient(
  'pk_123456789',
  {
    user: { key: 'user-id', email: 'user@example.com' }
  },
  {
    baseUrl: 'https://flags.hauses.dev/api',
    credentials: 'include'
  }
);
```

#### Methods

##### `initialize(): Promise<void>`

Initialize the client and fetch flags from the API.

```typescript
await client.initialize();
```

##### `getFlag(key: string): boolean`

Get the value of a specific flag. Returns `false` if the flag doesn't exist.

```typescript
const isEnabled = client.getFlag('feature-key');
```

##### `getFlags(): RawFlags`

Get all flags as an object.

```typescript
const flags = client.getFlags();
// { "feature-1": { key: "feature-1", isEnabled: true }, ... }
```

##### `setContext(context: FlagsContext): void`

Update the user/company context.

```typescript
client.setContext({
  user: {
    key: 'new-user-id',
    email: 'newuser@example.com'
  }
});
```

##### `isInitialized(): boolean`

Check if the client has been initialized.

```typescript
if (client.isInitialized()) {
  console.log('Client is ready');
}
```

##### `fetchFlags(): Promise<RawFlags | undefined>`

Manually fetch flags from the API (subject to rate limiting).

```typescript
const flags = await client.fetchFlags();
```

## Context & Targeting

The SDK supports user and company context for advanced targeting:

```typescript
interface FlagsContext {
  user?: {
    key: string;          // required - unique user identifier
    name?: string;        // optional - user's display name
    email?: string;       // optional - user's email address
  };
  company?: {
    key: string;          // required - unique company identifier
    name?: string;        // optional - company's display name
  };
}
```

### Example with Full Context

```typescript
const client = new FlagsClient('pk_123', {
  user: {
    key: 'user-123',
    name: 'Jane Smith',
    email: 'jane@example.com'
  },
  company: {
    key: 'acme-corp',
    name: 'Acme Corporation'
  }
});
```

## Event Tracking

The SDK automatically tracks flag access events for analytics. Events include:

- **user_context** - When a user context is set
- **check_flag_access** - When a flag is checked

These events are rate-limited to prevent excessive API calls.

## Rate Limiting

The SDK includes built-in rate limiting:

- Flag fetches are limited to prevent excessive API requests
- Event tracking is rate-limited per flag
- Default: 60 requests per minute per action

## HTTP Client

### `HttpClient`

Low-level HTTP client for making API requests.

```typescript
import { HttpClient } from '@hauses/flags-core';

const client = new HttpClient('pk_123', {
  baseUrl: 'https://flags.hauses.dev/api',
  credentials: 'include'
});

// GET request
const response = await client.get({
  path: 'flags',
  params: new URLSearchParams({ key: 'value' })
});

// POST request
const response = await client.post({
  path: 'events',
  body: { event: 'check_flag_access' }
});
```

## TypeScript Types

```typescript
interface Flag {
  key: string;
  isEnabled: boolean;
}

type RawFlags = Record<string, Flag>;

interface FlagsContext {
  company?: CompanyContext;
  user?: UserContext;
}

interface UserContext {
  key: string;
  name?: string;
  email?: string;
}

interface CompanyContext {
  key: string;
  name?: string;
}

interface HttpClientOptions {
  baseUrl?: string;
  sdkVersion?: string;
  credentials?: RequestCredentials;
}
```

## Advanced Usage

### Custom Base URL

```typescript
const client = new FlagsClient(
  'pk_123',
  {},
  { baseUrl: 'https://custom.domain.com/api' }
);
```

### Without Context

```typescript
const client = new FlagsClient('pk_123');
await client.initialize();
```

### Updating Context Dynamically

```typescript
const client = new FlagsClient('pk_123', {
  user: { key: 'user-1' }
});

await client.initialize();

// Later, when user changes
client.setContext({
  user: { key: 'user-2', email: 'user2@example.com' }
});

// Fetch updated flags
await client.fetchFlags();
```

## Error Handling

The SDK handles errors gracefully:

```typescript
try {
  await client.initialize();
} catch (error) {
  console.error('Failed to initialize flags client:', error);
  // Client will return false for all flags if initialization fails
}

// Safe to use even if initialization failed
const isEnabled = client.getFlag('feature'); // Returns false
```

## Browser Support

Works in all modern browsers that support:
- ES6+ / ES2015+
- Fetch API
- Promises

## Node.js Support

Compatible with Node.js 18+ (requires native fetch support).

## License

MIT

## Support

- 📧 Email: jordi.casas004@gmail.com
- 🌐 Website: [flags.hauses.dev](https://flags.hauses.dev)
- 📖 Documentation: [flags.hauses.dev/docs](https://flags.hauses.dev/docs)
- 🐛 Issues: [GitHub Issues](https://github.com/JordiCasasPla/flags-sdk/issues)

---

Part of the [Flags SDK](https://github.com/JordiCasasPla/flags-sdk) monorepo.