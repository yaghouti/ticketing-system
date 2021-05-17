const fs = require('fs');
const express = require('express');
let bodyParser = require('body-parser');
let logger = require('morgan');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const config = require('./configs')();
const redis = require('./configs/redis');
const app = express();

start();

async function start() {
  app.use(logger('dev'));
  app.use(bodyParser.json({limit: '10mb'}));
  app.use(bodyParser.urlencoded({extended: true, limit: '10mb'}));
  app.use(express.static(__dirname + '/views'));
  app.use(session({
    secret: config.session.secret,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    store: new RedisStore({
      host: config.redis.host,
      port: config.redis.port,
      client: redis.getRedisClient(config.session.redisDb),
      ttl: config.session.ttl
    })
  }));
  await loadRoutes();
  app.listen(config.server.port, () => console.log(`Ticketing System app listening on port ${config.server.port}!`));
}

function loadRoutes() {
  return new Promise(function (resolve, reject) {
    fs.readdir('./controllers', function (error, files) {
      if (error) {
        console.log('Error while loading routes!');
        reject(error);
      }

      files.forEach(function (file) {
        let routesList = require('./controllers/' + file);
        routesList.forEach(function (routeObj) {
          app[routeObj.method](routeObj.route, routeObj.controller);
        });
      });

      resolve();
    });
  })
}
