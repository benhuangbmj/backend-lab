const findMaxID = (db, tbName, col) => {
  sql = `SELECT MAX(${col}) AS max_id FROM ${tbName}`;
  const promise = new Promise((res, rej) => {
      db.all(sql, [], (err, rows) => {
        if(err) {
          console.error(err.message);
          rej(err.message);
        } else {      
          const output = rows[0].max_id;
          res(output);
        }
      })
  })
  return promise;  
}

exports.findMaxID = findMaxID;