const Shared = require("./shared").Shared;
const insertMultipleRows = require("./insertMultipleRows");
function setSupervisors(data) {
	const shared = new Shared();
	shared.openMainDb();
	shared.mainDb.run(
		"DELETE FROM supervision WHERE user=?;",
		[data.user],
		(err) => {
			if (err) console.log(err);
			shared.closeMainDb();
		},
	);
	if (data.supervisors.length > 0) {
		insertMultipleRows({
			tbName: "supervision",
			rows: data.supervisors,
		});
	}
}

module.exports = setSupervisors;
