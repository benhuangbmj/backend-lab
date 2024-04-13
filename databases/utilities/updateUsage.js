require("dotenv").config({ path: "../../.env" });

async function updateUsage() {
  async function authSheets() {
    const { google } = require("googleapis");
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_CREDENTIAL,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const authClient = await auth.getClient();

    const sheets = google.sheets({ version: "v4", auth: authClient });
    return {
      auth,
      authClient,
      sheets,
    };
  }

  const { sheets } = await authSheets();

  async function readSheets(id, range) {
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: range,
    });
    return getRows.data;
  }

  async function prepare() {
    const dayjs = require("dayjs");
    const utc = require("dayjs/plugin/utc");
    dayjs.extend(utc);
    const rawData = await readSheets(process.env.GOOGLE_SHEET_ID, "Sheet1");
    rawData.values.shift();
    utcOffset = dayjs().utcOffset();
    const output = Array.from(rawData.values, (e, i) => {
      return {
        email: e[1],
        courses: e[2],
        start_time: dayjs(e[3])
          .utcOffset(2 * utcOffset)
          .format("M/D/YY H:mm:ss"),
      };
    });
    return output;
  }
  const { utils } = require("./utils");
  const rows = await prepare();
  rows.forEach((e) => {
    utils.insertToTable({
      tbName: "usage",
      row: e,
    });
  });
  sheets.spreadsheets.values.clear({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Sheet1!A2:D",
  });
}

module.exports = updateUsage;
