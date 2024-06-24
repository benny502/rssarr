const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("data/database.json");
const db = low(adapter);
db.defaults({ patterns: [] }).write();

// reformat id and offset in patterns to integer
db.get('patterns').value().forEach((pattern) => {
  pattern.id = parseInt(pattern.id);
  pattern.offset = parseInt(pattern.offset) || 0;
});
db.write();

module.exports = db;

// import { JSONFileSyncPreset } from 'lowdb/node';
// const defaultData = { patterns: [] };
// const db = JSONFileSyncPreset('data/database.json', defaultData);

// export default db;
