exports.utils = {};
const utils = exports.utils;
utils.openDatabase = require('./openDatabase').openDatabase;
utils.closeDatabase = require('./closeDatabase').closeDatabase;
utils.selectBySup = require('./selectBySup').selectBySup;
utils.selectByUser = require('./selectByUser').selectByUser;
utils.selectSupervisees = require('./selectSupervisees').selectSupervisees;