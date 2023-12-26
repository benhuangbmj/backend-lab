const { findMaxID } = require('./findMaxID');
const { openDatabase } = require( './openDatabase' );
const { insertToTable } = require('./insertToTable');

const createTask = async (task) => {
  const db = openDatabase('progress');
  const currMaxID = await findMaxID(db, 'progress', 'task_id') || 0;
  let row = {
    task_id: currMaxID + 1,
    cumulative: 0,
    in_progress: null,
    complete: 0
  }
  row = Object.assign(row, task);
  insertToTable(db, 'progress', row, () => {createTask(task)});
}

exports.createTask = createTask;