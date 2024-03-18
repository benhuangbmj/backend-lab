function deleteTask(taskId) {
	const { utils } = require("./utils");
	const { Shared } = require("./shared");
	const shared = new Shared();
	sql = `DELETE FROM progress WHERE task_id=?`;
	shared.mainDb.run(sql, [taskId], (err) => {
		if (err) {
			console.log(err);
		} else {
			shared.closeMainDb();
		}
	});
}

module.exports = deleteTask;
