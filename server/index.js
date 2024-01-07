import './env.js';
import server from './server.js';
import express from 'express';
import './rss.js';
import './proxy.js';
import './sonarr.js';
import './jwt.js';
import './api.js';

server.use(express.json());

const port = parseInt(process.env.PORT || "12306");
server.listen(port, () => {
  console.log(`App started on port ${port}`);
});
