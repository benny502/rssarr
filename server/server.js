import jsonServer from "json-server";
const server = jsonServer.create();
const middlewares = jsonServer.defaults({
  static: "./build",
});
server.use(middlewares);
server.use(jsonServer.bodyParser);

export default server;