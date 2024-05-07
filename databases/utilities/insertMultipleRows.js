function insertMultipleRows({ tbName, rows, io = null, message }) {
	const Shared = require("./shared").Shared;
	const shared = new Shared();
	shared.openMainDb();
	let columns = Object.keys(rows[0]);
	const values = Array.from(rows, (row) => {
		let placeholders = Array(columns.length).fill("?").join(",");
		placeholders = `(${placeholders})`;
		return placeholders;
	});
	const sql = `INSERT INTO ${tbName} (${columns.join(",")})
	VALUES ${values.join(",")};`;
	const parameters = Array.from(rows, (row) => Object.values(row)).flat();
	shared.mainDb.run(sql, parameters, (err) => {
		if (err) console.log(err);
		else if (io) io.emit(message);
		shared.closeMainDb();
	});
}

module.exports = insertMultipleRows;
