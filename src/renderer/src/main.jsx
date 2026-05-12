import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'reactflow/dist/style.css'
import './styles/globals.css'
import App from './App'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 text-primary">
          <div className="glass-panel max-w-xl rounded-2xl border border-danger/40 p-8">
            <p className="text-sm uppercase tracking-[0.3em] text-danger">Application Error</p>
            <h1 className="mt-3 text-3xl font-semibold">Axiom could not render safely.</h1>
            <p className="mt-4 text-sm text-muted">{this.state.error?.message || 'Unexpected renderer exception.'}</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function SecureBootstrap() {
  if (!window.axiom) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-primary">
        <div className="glass-panel max-w-xl rounded-2xl border border-warning/40 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-warning">Secure Bridge Missing</p>
          <h1 className="mt-3 text-3xl font-semibold">IPC bridge unavailable.</h1>
          <p className="mt-4 text-sm text-muted">
            The renderer was loaded without the protected preload API. Restart the app to restore the secure Axiom bridge.
          </p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <SecureBootstrap />
    </ErrorBoundary>
  </React.StrictMode>
)
