import { srvRouter } from './server.js';
import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET ?? process.env.SONARR_API_KEY;

srvRouter.post('/auth/login', (req, res) => {
  console.log(req);
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({
      username,
    }, secret, {
      algorithm: 'HS512',
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
    secret: secret,
    algorithms: ['HS512'],
  }),
  function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).send('Invalid token');
    }
  },
];

export default middlewares;
