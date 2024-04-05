import { srvRouter } from './server.js';
import * as fs from 'fs';
import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';

const pubKey = fs.readFileSync('data/jwt.key.pub');
const privKey = fs.readFileSync('data/jwt.key');

srvRouter.post('/auth/login', (req, res) => {
  console.log(req);
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({
      username,
    }, privKey, {
      algorithm: 'RS512',
    });
    res.json({
      token
    });
  } else {
    res.status('401');
    res.send('Username or password incorrect');
  }
});

const middlewares = [
  expressjwt({
    secret: pubKey,
    algorithms: ['RS512'],
  }),
  function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).send('Invalid token');
    }
  },
];

export default middlewares;
