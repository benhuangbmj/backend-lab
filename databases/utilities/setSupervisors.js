const Shared = require("./shared").Shared;

function setSupervisors(data) {
	const shared = new Shared();
	shared.openMainDb();
	shared.mainDb.all(
		"select * from supervision where user=?;",
		[data.user],
		(err, rows) => {
			console.log(rows);
		},
	);
}

module.exports = setSupervisors;
