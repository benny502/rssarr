import db from './db.cjs';
import jsonServer from 'json-server';
import server from './server.js';
import middlewares from './jwt.js';

const router = jsonServer.router(db);
server.use("/api", ...middlewares, router);
