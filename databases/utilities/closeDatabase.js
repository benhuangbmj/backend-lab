const closeDatabase = (db, dbName) => {
  const callback = (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`Closed the database ${dbName}.`);
    }
  };
  db.close(callback);
}

exports.closeDatabase = closeDatabase;