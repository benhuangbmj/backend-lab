const createTable = (db, tableName, columns) => {
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
		}
	});
};

exports.createTable = createTable;
