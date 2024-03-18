const { openDatabase } = require("./openDatabase");
const { closeDatabase } = require("./closeDatabase");

class Shared {
  constructor() {
    this.mainDatabase = "math_lab";
    this.mainDb = openDatabase(this.mainDatabase);
  }
  closeMainDb() {
    closeDatabase(this.mainDb, this.mainDatabase);
  }
}

exports.Shared = Shared;
