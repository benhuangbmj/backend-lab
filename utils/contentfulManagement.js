require("dotenv").config({ path: "../.env" });
const contentful = require("contentful-management");
const client = contentful.createClient(
	{
		accessToken: process.env.CMA_TOKEN,
	},
	{
		type: "plain",
		defaults: {
			spaceId: process.env.SPACE_ID,
			environmentId: "master",
		},
	},
);
async function updateUserInfo({ userInfo }) {
	const entry = await client.entry.get({
		entryId: process.env.ENTRY_ID_USERDATA,
	});
	const data = {
		tutorInfo: {
			"en-US": userInfo,
		},
	};
	const updated = await client.entry.update(
		{
			entryId: process.env.ENTRY_ID_USERDATA,
		},
		{
			fields: data,
			sys: entry.sys,
		},
	);
	const published = await client.entry.publish(
		{
			entryId: process.env.ENTRY_ID_USERDATA,
		},
		updated,
	);
	console.log("User info updated!");
}
async function injectTitle({ userInfo }) {
	for (let user in userInfo) {
		if (/\d+/.test(user)) {
			userInfo[user].title = "Student";
		}
	}
	updateUserInfo({ userInfo: userInfo });
}
module.exports = { updateUserInfo, injectTitle };
