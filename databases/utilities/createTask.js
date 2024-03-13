const { findMaxID } = require("./findMaxID");
const { openDatabase } = require("./openDatabase");
const { insertToTable } = require("./insertToTable");

const { Shared } = require("./shared");
const shared = new Shared();

const createTask = async (task, io) => {
  const db = openDatabase(shared.mainDatabase);
  const currMaxID = (await findMaxID(db, "progress", "task_id")) || 0;
  let row = {
    task_id: currMaxID + 1,
    cumulative: 0,
    in_progress: null,
    complete: 0,
    created_at: Date.now(),
  };
  row = Object.assign(row, task);
  insertToTable({
    db: db,
    tbName: "progress",
    row: row,
    callback: () => {
      createTask(task);
    },
    io: io,
  });
};

exports.createTask = createTask;
