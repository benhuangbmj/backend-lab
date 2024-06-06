const backupUsers = require("./backupUsers");
const readContentfulUsers = require("./readContentfulUsers");
const fetchBlogPosts = require("./fetchBlogPosts");
const { updateUserInfo, injectTitle } = require("./contentfulManagement");
module.exports = {
	backupUsers,
	readContentfulUsers,
	fetchBlogPosts,
	updateUserInfo,
	injectTitle,
};
