const insertToTable = async ({
  db,
  tbName,
  row,
  callback,
  remainOpen = false,
  io,
}) => {
  if (!db) {
    const openDatabase = require("./utils").utils.openDatabase;
    const { Shared } = require("./shared");
    const shared = new Shared();
    db = await openDatabase(shared.mainDatabase);
  }
  let columns = [];
  let values = [];
  for (let key in row) {
    columns.push(key);
    values.push(row[key]);
  }
  columns = columns.join(",");
  const placeholders = Array(values.length).fill("?").join(",");
  const sql = `INSERT INTO ${tbName} (${columns}) VALUES (${placeholders})`;
  db.run(sql, values, (err) => {
    if (err) {
      console.error(err.message);
      setTimeout(callback, 2000);
    } else {
      console.log(`A row has been inserted into ${tbName}`);
      if (io) io.emit("taskUpdated");
    }
  });
  if (!remainOpen) {
    db.close((err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(`Closed the database.`);
      }
    });
  }
};

exports.insertToTable = insertToTable;
