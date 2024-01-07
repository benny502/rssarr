const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("data/database.json");
const db = low(adapter);
db.defaults({ patterns: [] }).write();

module.exports = db;

// import { JSONFileSyncPreset } from 'lowdb/node';
// const defaultData = { patterns: [] };
// const db = JSONFileSyncPreset('data/database.json', defaultData);

// export default db;
