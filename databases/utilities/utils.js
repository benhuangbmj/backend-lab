exports.utils = {};
const utils = exports.utils;
utils.openDatabase = require("./openDatabase").openDatabase;
utils.closeDatabase = require("./closeDatabase").closeDatabase;
utils.selectBySup = require("./selectBySup").selectBySup;
utils.selectByUser = require("./selectByUser").selectByUser;
utils.selectSupervisees = require("./selectSupervisees").selectSupervisees;
utils.createTable = require("./createTable").createTable;
utils.insertToTable = require("./insertToTable").insertToTable;
utils.selectAll = require("./selectAll");
utils.deleteTask = require("./deleteTask");
utils.updateUsage = require("./updateUsage");
utils.selectByCreatedBy = require("./selectByCreatedBy");
utils.insertMultipleRows = require("./insertMultipleRows");
