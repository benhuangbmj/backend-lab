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
async function update() {
	const entry = await client.entry.get({
		entryId: "3oATflDlhlycf5gXjJrPma",
	});
	//console.log(entry.fields.tutorInfo["en-US"]);
	const data = {
		tutorInfo: {
			"en-US": {},
		},
	};
	const update = await client.entry.update(
		{
			entryId: "3oATflDlhlycf5gXjJrPma",
		},
		{
			fields: data,
			sys: entry.sys,
		},
	);
	const publish = await client.entry.publish(
		{
			entryId: "3oATflDlhlycf5gXjJrPma",
		},
		update,
	);
	console.log(publish);
}

module.exports = { update };
//3oATflDlhlycf5gXjJrPma
