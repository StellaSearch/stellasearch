import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr({ svrOptions: { icon: true } })],
  server: {
	  proxy: { '/api': 'http://localhost:8000' },
  },
})
