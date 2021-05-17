let second = 1000; // milliseconds
let minute = 60 * second;
let config = {
  local: {
    mode: 'local',
    server: {
      port: 3000
    },
    mongo: {
      host: 'localhost',
      port: 27017,
      database: 'ticketingSystem'
    },
    session: {
      secret: 'A secret key...',
      resave: false,
      saveUninitialized: true,
      redisDb: 0,
      ttl: 30 * minute
    },
    redis: {
      host: 'localhost',
      port: 6379
    },
    locker: {
      redisDb: 1,
      instanceConfig: {
        // the expected clock drift; for more details
        // see http://redis.io/topics/distlock
        driftFactor: 0.01, // time in ms

        // the max number of times Redlock will attempt
        // to lock a resource before erroring
        retryCount: 10,

        // the time in ms between attempts
        retryDelay: 200, // time in ms

        // the max time in ms randomly added to retries
        // to improve performance under high contention
        // see https://www.awsarchitectureblog.com/2015/03/backoff.html
        retryJitter: 200
      },
      // the maximum amount of time you want the resource locked in milliseconds,
      // keeping in mind that you can extend the lock up until
      // the point when it expires
      ttl: 3000
    }
  },
  staging: {
    mode: 'staging',
    server: {
      port: 4000
    },
    mongo: {
      host: 'localhost',
      port: 27017,
      database: 'ticketingSystem'
    },
    session: {
      secret: 'A secret key...',
      resave: false,
      saveUninitialized: true,
      redisDb: 0,
      ttl: 30 * minute
    },
    redis: {
      host: 'localhost',
      port: 6379
    },
    locker: {
      redisDb: 1,
      instanceConfig: {
        // the expected clock drift; for more details
        // see http://redis.io/topics/distlock
        driftFactor: 0.01, // time in ms

        // the max number of times Redlock will attempt
        // to lock a resource before erroring
        retryCount: 10,

        // the time in ms between attempts
        retryDelay: 200, // time in ms

        // the max time in ms randomly added to retries
        // to improve performance under high contention
        // see https://www.awsarchitectureblog.com/2015/03/backoff.html
        retryJitter: 200
      },
      // the maximum amount of time you want the resource locked in milliseconds,
      // keeping in mind that you can extend the lock up until
      // the point when it expires
      ttl: 3000
    }
  },
  production: {
    mode: 'production',
    server: {
      port: 5000
    },
    mongo: {
      host: 'localhost',
      port: 27017,
      database: 'ticketingSystem'
    },
    session: {
      secret: 'A secret key...',
      resave: false,
      saveUninitialized: true,
      redisDb: 0,
      ttl: 30 * minute
    },
    redis: {
      host: 'localhost',
      port: 6379
    },
    locker: {
      redisDb: 1,
      instanceConfig: {
        // the expected clock drift; for more details
        // see http://redis.io/topics/distlock
        driftFactor: 0.01, // time in ms

        // the max number of times Redlock will attempt
        // to lock a resource before erroring
        retryCount: 10,

        // the time in ms between attempts
        retryDelay: 200, // time in ms

        // the max time in ms randomly added to retries
        // to improve performance under high contention
        // see https://www.awsarchitectureblog.com/2015/03/backoff.html
        retryJitter: 200
      },
      // the maximum amount of time you want the resource locked in milliseconds,
      // keeping in mind that you can extend the lock up until
      // the point when it expires
      ttl: 3000
    }
  }
};
module.exports = function (mode) {
  return config[mode || process.argv[2] || process.env.MODE || 'local'] || config.local;
};