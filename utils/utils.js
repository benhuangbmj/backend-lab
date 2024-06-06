const backupUsers = require("./backupUsers");
const readContentfulUsers = require("./readContentfulUsers");
const fetchBlogPosts = require("./fetchBlogPosts");
const updateUserInfo = require("./contentfulManagement").updateUserInfo;
module.exports = {
	backupUsers,
	readContentfulUsers,
	fetchBlogPosts,
	updateUserInfo,
};
