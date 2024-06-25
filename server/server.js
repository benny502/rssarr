import jsonServer from "json-server";
import { Router } from "express";
const server = jsonServer.create();
const srvRouter = Router();
const middlewares = jsonServer.defaults({
  static: "./public",
});
srvRouter.use(middlewares);
srvRouter.use(jsonServer.bodyParser);

export default server;
export { server, srvRouter };
