import server from './server.js';
import { createProxyMiddleware } from 'http-proxy-middleware';
import middlewares from './jwt.js';

server.use(
  "/sonarr",
  ...middlewares,
  createProxyMiddleware({
    target: process.env.SONARR_HOST,
    pathRewrite(path, req) {
      const url = new URL(req.url, `http://${req.headers.host}`);
      url.searchParams.append("apikey", process.env.SONARR_API_KEY);
      url.pathname = url.pathname.replace(/^\/sonarr/, "/api/v3");
      return `${url.pathname}${url.search}`;
    },
    changeOrigin: true,
  })
);
