import { bootstrap } from 'global-agent';
import xml2js from 'xml2js';
import axios from 'axios';
import qs from 'qs';
import db from './db.cjs';
import { srvRouter } from './server.js';

bootstrap();
const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

const route = async (req, res) => {
  try {
    const mikan_host = process.env.MIKANANIME_HOST.replace(/\/$/, "");
    const { data: xmlStr } = await axios.get(
      `${mikan_host}${req.path}?${qs.stringify(req.query)}`
    );
    const result = await parser.parseStringPromise(xmlStr);

    // torrent proxy download url
    let torrentProxy = req.protocol + "://" + req.get('Host') + process.env.BASE_URL;
    if (torrentProxy.endsWith('/')) torrentProxy += 'torrent';
    else torrentProxy += '/torrent';

    // pre-compile
    const database = db.get("patterns").value();
    const rules = database.map(({ pattern, ...rest }) => ({
      pattern: new RegExp(`^${pattern}$`),
      ...rest,
    }));

    const items = [];
    for (const item of result.rss.channel[0].item) {
      const {
        title: [title],
        enclosure,
        link,
        torrent: [{ pubDate }],
      } = item;
      for (const { pattern, series, season, language, quality, offset } of rules) {
        const match = title.match(pattern);
        if (!match?.groups?.episode) continue;
        const { episode } = match.groups;
        const episodeWithOffset =
          Number.parseInt(episode) + (Number.parseInt(offset) || 0);
        const normalized = `${series} - S${season}E${episodeWithOffset} - ${language} - ${quality}`;
        const params = new URLSearchParams();
        params.append("url", enclosure[0].$.url);
        params.append("name", normalized);
        const newUrl = `${torrentProxy}?${params.toString()}`;
        items.push({
          title: [normalized],
          pubDate,
          enclosure: [
            {
              $: {
                url: newUrl,
                type: enclosure[0].$.type,
                length: enclosure[0].$.length,
              },
            },
          ],
          link,
          guid: [
            {
              $: { isPermaLink: true },
              _: link[0],
            },
          ],
        });
        break;
      }
    }
    result.rss.channel[0].item = items;
    res.set("Content-Type", "text/xml");
    res.send(builder.buildObject(result));
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal Server Error");
  }
};

srvRouter.get("/RSS/*", route);
