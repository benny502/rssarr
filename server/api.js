import db from './db.cjs';
import jsonServer from 'json-server';
import { srvRouter } from './server.js';
import middlewares from './jwt.js';

const router = jsonServer.router(db);
srvRouter.use("/api", ...middlewares, router);
