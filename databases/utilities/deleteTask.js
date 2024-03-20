function deleteTask(taskId, io) {
	const { utils } = require("./utils");
	const { Shared } = require("./shared");
	const shared = new Shared();
	sql = `DELETE FROM progress WHERE task_id=?`;
	const db = shared.openMainDb();
	db.run(sql, [taskId], (err) => {
		if (err) {
			console.log(err);
		} else {
			shared.closeMainDb();
			io.emit("taskUpdated");
		}
	});
}

module.exports = deleteTask;
