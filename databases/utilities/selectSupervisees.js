const selectSupervisees = (supervisor) => {
  const { utils } = require("./utils.js");
  const { Shared } = require("./shared.js");
  const shared = new Shared();
  return new Promise((res, rej) => {
    const db = shared.openMainDb();
    const sql = `      
      SELECT user 
      FROM supervision
      WHERE supervisor = ?;    
    `;
    db.all(sql, [supervisor], (err, rows) => {
      if (err) {
        rej(err);
      }
      utils
        .closeDatabase(db, shared.mainDatabase)
        .then(() => {
          res(rows);
        })
        .catch((err) => rej(err));
    });
  });
};

exports.selectSupervisees = selectSupervisees;
