const selectByCreatedBy = (creator) => {
  const { utils } = require("./utils.js");
  const { Shared } = require("./shared.js");
  const shared = new Shared();
  return new Promise((res, rej) => {
    const db = shared.openMainDb();
    const sql = `
      SELECT * FROM progress
      WHERE created_by = ?
    `;
    db.all(sql, [creator], (err, rows) => {
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

module.exports = selectByCreatedBy;
