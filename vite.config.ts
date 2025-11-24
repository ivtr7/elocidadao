import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig({
  // Ensure UTF-8 encoding
  build: {
    charset: 'utf8',
    rollupOptions: {
      output: {
        charset: 'utf8'
      }
    }
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
            // Ensure UTF-8 headers
            proxyReq.setHeader('Accept', 'application/json; charset=utf-8');
            proxyReq.setHeader('Accept-Charset', 'utf-8');
            proxyReq.setHeader('Content-Type', 'application/json; charset=utf-8');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            // Ensure UTF-8 in response
            proxyRes.headers['content-type'] = 'application/json; charset=utf-8';
            proxyRes.headers['accept-charset'] = 'utf-8';
          });
        },
      }
    }
  }
})
