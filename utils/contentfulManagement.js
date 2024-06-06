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
	//console.log(published.fields.tutorInfo["en-US"]); //remove
	console.log("updateUserInfo");
}

module.exports = { updateUserInfo };
