const { openDatabase } = require("./openDatabase");
const { closeDatabase } = require("./closeDatabase");

class Shared {
  constructor() {
    this.mainDatabase = "math_lab";
    this.mainDb = null;
  }
  openMainDb() {
    this.mainDb = openDatabase(this.mainDatabase);
    return this.mainDb;
  }
  closeMainDb() {
    if (this.mainDb) closeDatabase(this.mainDb, this.mainDatabase);
  }
}

exports.Shared = Shared;
