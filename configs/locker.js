let Redlock = require('redlock');
const config = require('./index')();
const redis = require('./redis');
let errors = require("./errors");

let lock;

exports.getLocker = async function () {
  if (lock) {
    return lock;
  }

  try {
    let redisClient = await redis.getRedisClient(config.locker.redisDb);
    let redlock = new Redlock(
      // you should have one client for each independent redis node
      // or cluster
      [redisClient],
      config.locker.instanceConfig
    );
    lock = redlock;
    return redlock;
  }
  catch (e) {
    handleError(errors.createLockerError, {e});
  }
};
function handleError(errorObj, additionalInfo) {
  log(errorObj, additionalInfo);
  throw errorObj;
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}
