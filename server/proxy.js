import axios from 'axios';
import xml2js from 'xml2js';
import server from './server.js';

const parser = new xml2js.Parser();

server.get("/proxy", async (req, res) => {
  // proxy only requests to mikan anime to prevent attacks
  if (!req?.query?.url?.startsWith(process.env.MIKANANIME_HOST)) {
    res.status(403).send("Forbidden");
    return;
  }
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
});
