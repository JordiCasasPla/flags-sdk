import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { FlagsProvider } from 'react-sdk'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <FlagsProvider
      publishableKey={import.meta.env.VITE_FLAGS_PUBLISHABLE_KEY || 'your-publishable-key-here'}
      // We keep this false by default, and let the feature flag enable it in App.tsx
      toolbar={false}
      context={{
        user: {
          key: '18',
          email: 'test@test.com',
          name: 'Test User',
        },
        company: {
          key: 'company_67890',
          name: 'Test Company',
        }
      }}
    >
      <App />
    </FlagsProvider>
)
