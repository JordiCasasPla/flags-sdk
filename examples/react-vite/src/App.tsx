import { useState } from 'react'
import { useFlags } from 'react-sdk'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const { isEnabled: isNewFeatureEnabled, isLoading } = useFlags('new-feature')

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div className="card">
        {isLoading ? (
          <p>Loading flags...</p>
        ) : (
          <p>
            New Feature Flag: <strong>{isNewFeatureEnabled ? 'Enabled ✅' : 'Disabled ❌'}</strong>
          </p>
        )}
      </div>
    </>
  )
}

export default App
