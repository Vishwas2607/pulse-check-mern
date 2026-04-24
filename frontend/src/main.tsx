import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthenticationProvider } from './features/auth/context/AuthenticationContext.tsx'
import { AxiosInterceptor } from './api/AxiosInterceptor.tsx'

const queryClient = new QueryClient({defaultOptions: {
  queries: {
    refetchOnWindowFocus: true,
    retry: 1
  }
}});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthenticationProvider>
        <AxiosInterceptor>
          <QueryClientProvider client={queryClient}>
              <App/>
          </QueryClientProvider>
        </AxiosInterceptor>
      </AuthenticationProvider>
    </BrowserRouter>
    
  </StrictMode>,
)
