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
    }
  }
};
module.exports = function (mode) {
  return config[mode || process.argv[2] || process.env.MODE || 'local'] || config.local;
};