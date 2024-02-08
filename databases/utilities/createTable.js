const utils = require("./utils").utils;

const { Shared } = require("./shared");
const shared = new Shared();

const createTable = async (tableName, columns) => {
	const db = await utils.openDatabase(shared.mainDatabase);
	let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;
	columns.forEach((column) => {
		sql += `${column} TEXT,\n`;
	});
	sql = sql.replace(/,\n$/, ")");
	db.run(sql, [], (err) => {
		if (err) {
			console.error(err.message);
		} else {
			console.log(`Created the table ${tableName}.`);
			utils.closeDatabase(db, shared.mainDatabase);
		}
	});
};

exports.createTable = createTable;
