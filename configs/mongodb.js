const MongoClient = require('mongodb').MongoClient;
const config = require('./index')();
let errors = require("./errors");

// Connection URL
const url = `mongodb://${config.mongo.host}:${config.mongo.port}`;

// Database Name
const dbName = config.mongo.database;

let client;

exports.getDbObject = async function () {
  if (client && client.isConnected()) {
    return client.db(dbName);
  }

  try {
    // Use connect method to connect to the server
    client = await MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true});
    return client.db(dbName);
  }
  catch (e) {
    handleError(errors.mongoConnError, {e});
  }
};

exports.close = function () {
  client.close();
};

function handleError(errorObj, additionalInfo) {
  log(errorObj, additionalInfo);
  throw errorObj;
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}
