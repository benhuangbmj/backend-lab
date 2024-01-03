const {utils} = require('./utils.js');
const {Shared} = require('./shared.js');
const shared = new Shared();

exports.selectByUser = (user) => {
  return new Promise((res, rej) => {    
    const db = utils.openDatabase(shared.mainDatabase);    
    const sql = `
      SELECT * FROM progress
      WHERE user = ?;
    `
    db.all(sql, [user], (err, rows) => {
      if (err) {
        rej(err);
      }
      utils.closeDatabase(db, shared.mainDatabase).then(() => {
        res(rows);
      }).catch(err => rej(err));
    });    
  });
}