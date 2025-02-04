import { bootstrap } from 'global-agent';
import xml2js from 'xml2js';
import axios from 'axios';
import qs from 'qs';
import db from './db.cjs';
import { srvRouter } from './server.js';
import { processItems, getTorrentProxy } from './utils.js';

bootstrap();
const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

const route = async (req, res) => {
  try {
    const rss_url = req.path.replace(/^\/RSS\//, '');
    const { data: xmlStr } = await axios.get(
      `https://${rss_url}?${qs.stringify(req.query)}`
    );
    const result = await parser.parseStringPromise(xmlStr);

    const host = rss_url.split('/')[0];
    const isMikan = host.includes('mikan');

    // pre-compile
    const database = db.get("patterns").value();
    const rules = database.map(({ pattern, ...rest }) => ({
      pattern: new RegExp(`^${pattern}$`),
      ...rest,
    }));
    const releaseGroup = /^[\[【](?<subgroup>[^\]】]+?)[\]】].*$/;

    // trackers for magnet
    const trackers = new URLSearchParams();
    trackers.append("tr", "http://t.acg.rip:6699/announce");
    trackers.append("tr", "http://nyaa.tracker.wf:7777/announce");
    trackers.append("tr", "https://tr.bangumi.moe:9696/announce");
    trackers.append("tr", "https://tr.bangumi.moe:6969/announce");
    trackers.append("tr", "http://open.acgnxtracker.com/announce");
    trackers.append("tr", "https://open.acgnxtracker.com/announce");

    const items = await processItems(
      result.rss.channel[0].item,
      rules,
      req,
      isMikan
    );
    result.rss.channel[0].item = items;
    res.set("Content-Type", "text/xml");
    res.send(builder.buildObject(result));
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
};

srvRouter.get("/RSS/*", route);
