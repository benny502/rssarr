import './env.js';
import { server, srvRouter } from './server.js';
import express from 'express';
import './rss.js';
import './proxy.js';
import './sonarr.js';
import './jwt.js';
import './api.js';

srvRouter.use(express.json());

const baseUrl = process.env.BASE_URL || '/';
server.use(baseUrl, srvRouter);

const port = parseInt(process.env.PORT || "12306");
server.listen(port, () => {
  console.log(`App started on port ${port}`);
});
