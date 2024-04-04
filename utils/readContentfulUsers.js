require("dotenv").config({ path: "../.env" });
const contentful = require("contentful");

module.exports = async function () {
	const client = contentful.createClient({
		space: process.env.SPACE_ID,
		accessToken: process.env.ACCESS_TOKEN,
	});
	let data = await client.getEntries();
	output = data.items[0].fields.tutorInfo;
	return output;
};
