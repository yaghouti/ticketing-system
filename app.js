const fs = require('fs');
const express = require('express');
let bodyParser = require('body-parser');
let logger = require('morgan');
const app = express();

start();

async function start() {
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(express.static(__dirname + '/views'));
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
