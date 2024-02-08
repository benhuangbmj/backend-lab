const { openDatabase } = require("./openDatabase.js");

const selectAll = async (dbName, tbName) => {
  const db = await openDatabase(dbName);
  const sql = `SELECT * FROM ${tbName}`;
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      const closePromise = new Promise((res, rej) => {
        db.close((err) => {
          if (err) {
            rej(err);
          }
          res(true);
        });
      });
      closePromise
        .then(() => {
          console.log("Closed database successfully");
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        })
        .catch((err) => reject(err));
    });
  });
};

module.exports = selectAll;
