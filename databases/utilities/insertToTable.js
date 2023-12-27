const insertToTable = (db, tbName, row,callback) => {
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
    }
  });

  db.close((err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`Closed the database.`);
    }
  });
};

exports.insertToTable = insertToTable;
