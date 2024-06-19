import axios from 'axios';
import xml2js from 'xml2js';
import middlewares from './jwt.js';
import { srvRouter } from './server.js';

const parser = new xml2js.Parser();

const proxy = async (req, res) => {
  try {
    const { data: xmlStr } = await axios.get(req.query.url);
    const result = await parser.parseStringPromise(xmlStr);
    const titles = result.rss.channel[0].item.map(
      ({ title: [title] }) => title
    );
    res.send(titles);
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
};

srvRouter.use("/proxy", ...middlewares, proxy);
