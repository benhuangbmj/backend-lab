const {openDatabase} = require('./openDatabase.js');

const insertToTable = (dbName, tbName, row) => {
  const db = openDatabase(dbName);
  const callback = (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`Closed the database ${dbName}.`);
    }
  }
  
  let columns = [];
  let values = [];
  
  for (let key in row) {
    columns.push(key);
    values.push(row[key]);
  }
  columns = columns.join(',');
  const placeholders = Array(values.length).fill('?').join(',');
  const sql = `INSERT INTO ${tbName} (${columns}) VALUES (${placeholders})`;
  db.run(sql, values, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`A row has been inserted into ${tbName}`);
    }
  })
  
  db.close(callback);
}

exports.insertToTable = insertToTable;
