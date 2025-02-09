const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const rootPath = path.resolve(__dirname, "..");
function openDatabase(dbName) {
	return new sqlite3.Database(
		path.resolve(rootPath, `${dbName}.db`),
		sqlite3.OPEN_READWRITE,
		(err) => {
			if (err) {
				console.log("openDatabase", dbName);
				console.error(err.message);
			} else {
				console.log(`Connected to the ${dbName} database.`);
			}
		}
	);
}
exports.openDatabase = openDatabase;
