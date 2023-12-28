const { openDatabase } = require("./openDatabase.js");
const { closeDatabase } = require("./closeDatabase.js");
const { selectAll } = require("./selectAll.js");

const updateTask = (dbName, tbName, data, io=null) => {
  const db = openDatabase(dbName);
  let columns=[];
  for (let key in data) {
    if (key != "task_id") {
      columns.push(key);
    }
  }
  let sql = `UPDATE ${tbName} SET`;
  columns.forEach((e,i) => {    
    sql += ` ${e} = ?`;
    if (i < columns.length-1) {
      sql += ",";
    }
  });
  sql += ` WHERE task_id = ?`;
  
  const output = new Promise((res, rej) => {
    const parameters = [];
    columns.forEach(e => {
      parameters.push(data[e]);
    })
    parameters.push(data.task_id);
    db.run(sql, parameters, (err) => {
      if (err) {
        console.log(err.message);
        rej(err);
      } else {
        closeDatabase(db, dbName)
          .then(() => {
            if(io) {
                selectAll('progress', 'progress')
                .then((data) => {
                  io.emit("receiveDisplay", data);
                })
                .catch((err) => {
                  io.emit("receiveDisplay", err);
                });
            }            
            res([sql, parameters]);
          })
          .catch((err) => {
            rej(err);
          });
      }
    });
  });
  return output;
};

exports.updateTask = updateTask;
