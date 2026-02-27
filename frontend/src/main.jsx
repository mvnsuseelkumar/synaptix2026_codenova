import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30000,
        },
    },
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1E293B',
                            color: '#F1F5F9',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                        },
                        success: { iconTheme: { primary: '#10B981', secondary: '#F1F5F9' } },
                        error: { iconTheme: { primary: '#EF4444', secondary: '#F1F5F9' } },
                    }}
                />
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
)
