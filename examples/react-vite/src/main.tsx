import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FlagsProvider } from 'react-sdk'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FlagsProvider publishableKey={import.meta.env.VITE_FLAGS_PUBLISHABLE_KEY || 'your-publishable-key-here'} context={{ user: {
      key: 'user_12345',
      email: 'test@test.com',
      name: 'Test User',
    }, company: {
      key: 'company_67890',
      name: 'Test Company',
    }
    }}>
      <App />
    </FlagsProvider>
  </StrictMode>,
)
