# @hauses/react-sdk

React SDK for feature flags with hooks and providers.

🌐 **Website:** [flags.hauses.dev](https://flags.hauses.dev)

## Installation

```bash
npm install @hauses/react-sdk
# or
yarn add @hauses/react-sdk
# or
pnpm add @hauses/react-sdk
# or
bun add @hauses/react-sdk
```

## Features

- 🎣 **React Hooks** - Simple `useFlags` hook for feature checks
- 🎯 **Type-safe** - Full TypeScript support with auto-generated types
- ⚡ **Lightweight** - Minimal bundle size
- 🔄 **Real-time** - Instant flag updates without redeployment
- 👥 **Context targeting** - Target flags based on user/company
- 🚀 **Easy setup** - Wrap your app and start using flags
- ⚛️ **React 19 ready** - Compatible with latest React versions

## Quick Start

### 1. Wrap your app with FlagsProvider

```tsx
import React from 'react';
import { FlagsProvider } from '@hauses/react-sdk';

function App() {
  return (
    <FlagsProvider
      publishableKey="your_publishable_key"
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
```

### 2. Use flags in your components

```tsx
import { useFlags } from '@hauses/react-sdk';

function FeatureComponent() {
  const { isEnabled, isLoading } = useFlags('new-feature');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {isEnabled ? (
        <NewFeature />
      ) : (
        <OldFeature />
      )}
    </div>
  );
}
```

## API Reference

### `<FlagsProvider>`

Provider component that makes flags available throughout your component tree.

#### Props

```tsx
interface FlagsProviderProps {
  publishableKey: string;
  context?: FlagsContext;
  options?: HttpClientOptions;
  children: React.ReactNode;
}
```

- **`publishableKey`** (string, required) - Your publishable key from flags.hauses.dev
- **`context`** (object, optional) - User and company context for targeting
- **`options`** (object, optional) - HTTP client configuration options
- **`children`** (ReactNode, required) - Your React components

#### Example

```tsx
<FlagsProvider
  publishableKey={process.env.REACT_APP_FLAGS_KEY}
  context={{
    user: {
      key: userId,
      email: userEmail,
      name: userName
    },
    company: {
      key: companyId,
      name: companyName
    }
  }}
  options={{
    baseUrl: 'https://flags.hauses.dev/api',
    credentials: 'include'
  }}
>
  <App />
</FlagsProvider>
```

### `useFlags(key)`

Hook to check if a feature flag is enabled.

#### Parameters

- **`key`** (string) - The flag key to check

#### Returns

```tsx
{
  isEnabled: boolean;
  isLoading: boolean;
}
```

- **`isEnabled`** - Whether the flag is enabled (`false` if loading or doesn't exist)
- **`isLoading`** - Whether flags are still being fetched

#### Example

```tsx
function MyComponent() {
  const darkMode = useFlags('dark-mode');
  const betaFeature = useFlags('beta-feature');

  if (darkMode.isLoading || betaFeature.isLoading) {
    return <Skeleton />;
  }

  return (
    <div className={darkMode.isEnabled ? 'dark' : 'light'}>
      {betaFeature.isEnabled && <BetaFeature />}
      <MainContent />
    </div>
  );
}
```

## TypeScript Support

### Auto-generated Types

Use the [@hauses/flags-cli](https://www.npmjs.com/package/@hauses/flags-cli) to generate type definitions:

```bash
npm install -D @hauses/flags-cli
```

Add to your `package.json`:

```json
{
  "scripts": {
    "flags:pull": "flags-cli pull --env REACT_APP_FLAGS_KEY --out src/flags.d.ts"
  }
}
```

Run the command:

```bash
npm run flags:pull
```

This generates a `flags.d.ts` file:

```typescript
import "@hauses/react-sdk";

declare module "@hauses/react-sdk" {
  export interface FlagValues {
    "dark-mode": boolean;
    "beta-feature": boolean;
    "new-dashboard": boolean;
  }
}
```

Now you get autocomplete and type safety:

```tsx
// ✅ TypeScript knows these flags exist
useFlags('dark-mode');
useFlags('beta-feature');

// ❌ TypeScript error - unknown flag
useFlags('unknown-flag');
```

## Context & Targeting

### Context Types

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

### Dynamic Context Updates

The context automatically updates when the prop changes:

```tsx
function App() {
  const [user, setUser] = useState(null);

  return (
    <FlagsProvider
      publishableKey={key}
      context={{
        user: user ? {
          key: user.id,
          email: user.email,
          name: user.name
        } : undefined
      }}
    >
      <YourApp />
    </FlagsProvider>
  );
}
```

## Advanced Usage

### Conditional Rendering

```tsx
function Dashboard() {
  const newDashboard = useFlags('new-dashboard');

  return newDashboard.isEnabled ? <NewDashboard /> : <LegacyDashboard />;
}
```

### Multiple Flags

```tsx
function Features() {
  const feature1 = useFlags('feature-1');
  const feature2 = useFlags('feature-2');
  const feature3 = useFlags('feature-3');

  return (
    <div>
      {feature1.isEnabled && <Feature1 />}
      {feature2.isEnabled && <Feature2 />}
      {feature3.isEnabled && <Feature3 />}
    </div>
  );
}
```

### Loading States

```tsx
function MyComponent() {
  const flag = useFlags('my-feature');

  if (flag.isLoading) {
    return <Spinner />;
  }

  return flag.isEnabled ? <NewUI /> : <OldUI />;
}
```

### Environment Variables

#### Create React App

```tsx
<FlagsProvider publishableKey={process.env.REACT_APP_FLAGS_KEY}>
```

#### Vite

```tsx
<FlagsProvider publishableKey={import.meta.env.VITE_FLAGS_KEY}>
```

#### Next.js

```tsx
<FlagsProvider publishableKey={process.env.NEXT_PUBLIC_FLAGS_KEY}>
```

## Server-Side Rendering (SSR)

The SDK is SSR-compatible. On the server, flags will be in loading state initially:

```tsx
function MyComponent() {
  const flag = useFlags('feature');

  // On server: isLoading = true, isEnabled = false
  // On client (after hydration): Real values loaded

  if (flag.isLoading) {
    return <div>Loading...</div>;
  }

  return flag.isEnabled ? <Feature /> : null;
}
```

## Examples

### A/B Testing

```tsx
function PricingPage() {
  const newPricing = useFlags('new-pricing-ui');

  return newPricing.isEnabled ? (
    <PricingV2 />
  ) : (
    <PricingV1 />
  );
}
```

### Feature Rollout

```tsx
function Editor() {
  const richEditor = useFlags('rich-text-editor');

  return richEditor.isEnabled ? (
    <RichTextEditor />
  ) : (
    <SimpleTextarea />
  );
}
```

### Beta Features

```tsx
function Navigation() {
  const betaMode = useFlags('beta-mode');

  return (
    <nav>
      <HomeLink />
      <ProfileLink />
      {betaMode.isEnabled && <BetaFeaturesLink />}
    </nav>
  );
}
```

## Best Practices

### 1. Wrap at the root level

```tsx
// ✅ Good - Wrap at root
function App() {
  return (
    <FlagsProvider publishableKey={key}>
      <Router>
        <Routes />
      </Router>
    </FlagsProvider>
  );
}

// ❌ Bad - Multiple providers
function App() {
  return (
    <Router>
      <FlagsProvider publishableKey={key}>
        <Route1 />
      </FlagsProvider>
      <FlagsProvider publishableKey={key}>
        <Route2 />
      </FlagsProvider>
    </Router>
  );
}
```

### 2. Handle loading states

```tsx
// ✅ Good - Handle loading
function Feature() {
  const flag = useFlags('feature');
  
  if (flag.isLoading) return <Skeleton />;
  return flag.isEnabled ? <New /> : <Old />;
}

// ❌ Bad - Ignore loading
function Feature() {
  const flag = useFlags('feature');
  return flag.isEnabled ? <New /> : <Old />; // Flickers during load
}
```

### 3. Use TypeScript types

```tsx
// ✅ Good - Type-safe
useFlags('known-flag'); // TypeScript validates this

// ❌ Bad - No validation
useFlags('typo-in-flg-name'); // Runtime error
```

## Peer Dependencies

- React ^19.0.0
- React-DOM ^19.0.0

Also works with React 18.x.

## Browser Support

Works in all modern browsers that support:
- ES6+ / ES2015+
- React 18+
- Fetch API

## License

MIT

## Support

- 📧 Email: jordi.casas004@gmail.com
- 🌐 Website: [flags.hauses.dev](https://flags.hauses.dev)
- 📖 Documentation: [flags.hauses.dev/docs](https://flags.hauses.dev/docs)
- 🐛 Issues: [GitHub Issues](https://github.com/JordiCasasPla/flags-sdk/issues)

---

Part of the [Flags SDK](https://github.com/JordiCasasPla/flags-sdk) monorepo.