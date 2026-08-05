import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/responsive.css'
import App from './App.jsx'
import { Router } from './router/Router.jsx'
import { ThemeProvider } from './store/ThemeProvider.jsx'
import { AuthProvider } from './store/AuthProvider.jsx'
import { ToastProvider } from './store/ToastProvider.jsx'
import { NotificationsProvider } from './store/NotificationsProvider.jsx'
import { DataProvider } from './store/DataProvider.jsx'
import { Toasts, ErrorBoundary } from './components/ui/feedback.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <DataProvider>
                <NotificationsProvider>
                  <App />
                  <Toasts />
                </NotificationsProvider>
              </DataProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  </StrictMode>,
)
