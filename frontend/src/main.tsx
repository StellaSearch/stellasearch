import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'leaflet/dist/leaflet.css'
import App from './App'

const qc = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
	<QueryClientProvider client={qc}>
		<App />
	</QueryClientProvider>
  </StrictMode>
)
