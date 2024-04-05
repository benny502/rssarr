import server from './server.js';
import { createProxyMiddleware } from 'http-proxy-middleware';
import middlewares from './jwt.js';

server.use(
  "/sonarr",
  ...middlewares,
  createProxyMiddleware({
    target: process.env.SONARR_HOST + "/api/v3",
    on: {
      proxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader("X-Api-Key", process.env.SONARR_API_KEY);
      }
    },
    changeOrigin: true,
  })
);
