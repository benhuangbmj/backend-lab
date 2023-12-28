const closeDatabase = (db, dbName) => {
  return new Promise((res, rej) => {
    db.close((err) => {
      if (err) {
        console.log(err.message);
        rej(err);
      } else {
        console.log(`Closed the ${dbName} database.`);
        res();
      }
    });
  });
};

exports.closeDatabase = closeDatabase;
