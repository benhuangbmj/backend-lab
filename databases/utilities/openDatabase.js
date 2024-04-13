const sqlite3 = require("sqlite3").verbose();
const rootPath = __dirname.match(/^[\w\W]+backend-lab\//)[0];

function openDatabase(dbName) {
  return new sqlite3.Database(
    `${rootPath}databases/${dbName}.db`,
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.log("openDatabase", dbName);
        console.error(err.message);
      } else {
        console.log(`Connected to the ${dbName} database.`);
      }
    },
  );
}

exports.openDatabase = openDatabase;
