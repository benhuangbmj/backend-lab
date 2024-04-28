require("dotenv").config({ path: "../.env" });
const contentful = require("contentful");

module.exports = async function () {
	const client = contentful.createClient({
		space: process.env.SPACE_ID,
		accessToken: process.env.ACCESS_TOKEN,
	});
	let entries = await client.getEntries({
		content_type: "cmpLabDevBlog",
		order: "sys.createdAt",
	});
	return entries;
};
