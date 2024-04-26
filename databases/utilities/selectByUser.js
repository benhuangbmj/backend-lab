exports.selectByUser = (user) => {
  const { utils } = require("./utils.js");
  const { Shared } = require("./shared.js");
  const shared = new Shared();
  return new Promise((res, rej) => {
    const db = shared.openMainDb();
    const sql = `
      SELECT * FROM progress
      WHERE user = ? AND created_by != ?;
    `;
    db.all(sql, [user, user], (err, rows) => {
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
