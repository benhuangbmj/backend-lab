require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");
const readContentfulUsers = require("./readContentfulUsers");

function backupUsers() {
	readContentfulUsers().then(function (data) {
		const tutorInfoJSON = JSON.stringify(data);

		let date = dayjs().format("MMDDYYYY");
		const backupPath = path.resolve(
			__dirname,
			"../backup/",
			"users_" + date + ".json",
		);
		fs.mkdir(path.dirname(backupPath), { recursive: true }, (err) => {
			if (err) {
				console.error("Error creating directory:", err);
				return;
			}
		});
		fs.writeFile(backupPath, tutorInfoJSON, (err) => {
			if (err) {
				console.error("Error writing file: ", err);
				return;
			}
			console.log("User data backupped to " + backupPath);
		});
	});
}

module.exports = backupUsers;
