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
    const rss_url = req.path.replace(/^\/RSS\//, '');
    const { data: xmlStr } = await axios.get(
      `https://${rss_url}?${qs.stringify(req.query)}`
    );
    const result = await parser.parseStringPromise(xmlStr);

    const host = rss_url.split('/')[0];
    const isMikan = host.includes('mikan');

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

    // trackers for magnet
    const trackers = new URLSearchParams();
    trackers.append("tr", "http://t.acg.rip:6699/announce");
    trackers.append("tr", "http://nyaa.tracker.wf:7777/announce");
    trackers.append("tr", "https://tr.bangumi.moe:9696/announce");
    trackers.append("tr", "https://tr.bangumi.moe:6969/announce");
    trackers.append("tr", "http://open.acgnxtracker.com/announce");
    trackers.append("tr", "https://open.acgnxtracker.com/announce");

    const items = [];
    for (const item of result.rss.channel[0].item) {
      const title = item.title[0];
      const link = item.link;
      const enclosure = item?.enclosure || [{ $: { url: link[0], type: 'application/x-bittorrent', length: 0 } }];
      const pubDate = item?.pubDate || item?.torrent?.[0]?.pubDate || [new Date().toISOString()];
      const isMagnet = enclosure[0].$.url.startsWith("magnet:");
      for (const { pattern, series, season, language, quality, offset } of rules) {
        const match = title.match(pattern);
        if (!match?.groups?.episode) continue;
        const { episode } = match.groups;
        const episodeWithOffset =
          Number.parseInt(episode) + (Number.parseInt(offset) || 0);
        const normalized = `${series} - S${season}E${episodeWithOffset} - ${language} - ${quality}`;
        let newUrl;
        if (isMagnet) {
          const trackersStr = trackers.toString();
          const dn = encodeURIComponent(normalized);
          const cleanMagnet = enclosure[0].$.url.split('&')[0];
          newUrl = `${cleanMagnet}&dn=${dn}&${trackersStr}`;
        } else {
          const params = new URLSearchParams();
          params.append("url", enclosure[0].$.url);
          if (match?.groups?.subgroup) {
            const { subgroup } = match.groups;
            const fullNormalized = `[${subgroup}] ${normalized}`;
            params.append("name", fullNormalized);
          } else {
            params.append("name", normalized);
          }
          newUrl = `${torrentProxy}?${params.toString()}`;
        }
        if (isMikan) {
          pubDate[0] = pubDate[0] + "+08:00"
        }
        items.push({
          title: [normalized],
          pubDate,
          enclosure: [
            {
              $: {
                url: newUrl,
                type: enclosure[0].$.type,
                length: enclosure[0].$.length || 0,
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
