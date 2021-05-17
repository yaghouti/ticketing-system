const redis = require('redis');
const config = require('./index')();
let errors = require("./errors");

let client = {};

exports.getRedisClient = function (db) {
  if (client[db]) {
    return client[db];
  }

  try {
    client[db] = redis.createClient(config.redis.port, config.redis.host);
    client[db].select(db);
    return client[db];
  }
  catch (e) {
    handleError(errors.redisConnError, {e});
  }
};

exports.quit = function (db) {
  client[db].quit();
};

function handleError(errorObj, additionalInfo) {
  log(errorObj, additionalInfo);
  throw errorObj;
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}
