let Doctor = require('../models/doctor');
let Drug = require('../models/drug');
let Secretary = require('../models/secretary');
let errors = require("../configs/errors");

module.exports = [
  {method: 'post', route: '/drugs', controller: createDrug},
  {method: 'get', route: '/drugs', controller: readDrugs},
  {method: 'delete', route: '/drugs/:name', controller: deleteDrug},
  {method: 'delete', route: '/drugs', controller: deleteDrugs}
];

async function createDrug(req, res, next) {
  let name = req.body.name;
  try {
    checkUserIsDoctor(req);
    let drug = new Drug(name);
    await drug.save();
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.drugAlreadyExists.code:
        log(error, {name});
        res.status(409).send({error: error});
        break;
      case errors.accessDenied.code:
        log(error, {type: req.session.type, username: req.session.username});
        res.status(403).send({error});
        break;
      default:
        log(errors.internalServerError, error);
        res.status(500).send({error: errors.internalServerError});
    }
  }
}

async function readDrugs(req, res, next) {
  try {
    checkUserIsDoctorOrSecretary(req);
    let drugs = await Drug.getAll();
    res.status(200).json({drugs});
  }
  catch (error) {
    switch (error.code) {
      case errors.accessDenied.code:
        log(error, {type: req.session.type, username: req.session.username});
        res.status(403).send({error});
        break;
      default:
        log(errors.internalServerError, error);
        res.status(500).send({error: errors.internalServerError});
    }
  }
}

async function deleteDrug(req, res, next) {
  let name = req.params.name;
  try {
    checkUserIsDoctor(req);
    let drug = new Drug(name);
    await drug.remove();
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.drugNotFound.code:
        log(error, {name});
        res.status(404).json({error});
        break;
      case errors.accessDenied.code:
        log(error, {type: req.session.type, username: req.session.username});
        res.status(403).send({error});
        break;
      default:
        log(errors.internalServerError, error);
        res.status(500).json({error: errors.internalServerError});
    }
  }
}

async function deleteDrugs(req, res, next) {
  try {
    checkUserIsDoctor(req);
    await Drug.removeDrugs(req.body);
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.accessDenied.code:
        log(error, {type: req.session.type, username: req.session.username});
        res.status(403).send({error});
        break;
      default:
        log(errors.internalServerError, error);
        res.status(500).json({error: errors.internalServerError});
    }
  }
}

function checkUserIsDoctor(req) {
  if (!req.session.username || req.session.type !== Doctor.type) {
    throw errors.accessDenied;
  }
}

function checkUserIsDoctorOrSecretary(req) {
  if (!req.session.username || (req.session.type !== Secretary.type && req.session.type !== Doctor.type)) {
    throw errors.accessDenied;
  }
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}