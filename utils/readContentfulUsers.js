require("dotenv").config({ path: "../.env" });
const contentful = require("contentful");

module.exports = async function () {
	const client = contentful.createClient({
		space: process.env.SPACE_ID,
		accessToken: process.env.ACCESS_TOKEN,
	});
	const entry = await client.getEntry(process.env.ENTRY_ID_USERDATA);
	const output = entry.fields.tutorInfo;
	return output;
};
