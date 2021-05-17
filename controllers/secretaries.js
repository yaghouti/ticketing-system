let Admin = require('../models/admin');
let Secretary = require('../models/secretary');
let errors = require("../configs/errors");

module.exports = [
  {method: 'post', route: '/secretaries', controller: createSecretary},
  {method: 'put', route: '/secretaries/:username', controller: updateSecretary},
  {method: 'get', route: '/secretaries/:username', controller: readSecretary},
  {method: 'get', route: '/secretaries', controller: readSecretaries},
  {method: 'delete', route: '/secretaries/:username', controller: deleteSecretary},
  {method: 'delete', route: '/secretaries', controller: deleteSecretaries}
];

async function createSecretary(req, res, next) {
  try {
    checkUserIsAdmin(req);
    await new Secretary({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      family: req.body.family,
      doctors: req.body.doctors || []
    });
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.secretaryAlreadyExists.code:
        log(error, {username: req.body.username});
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

async function updateSecretary(req, res, next) {
  let username = req.params.username;
  try {
    checkUserIsSecretaryOrAdmin(req);
    let secretary = await new Secretary({username});
    if (req.body.hasOwnProperty('password')) secretary.password = req.body.password;
    if (req.body.hasOwnProperty('name')) secretary.name = req.body.name;
    if (req.body.hasOwnProperty('family')) secretary.family = req.body.family;
    let promises = [];
    if (req.body.hasOwnProperty('doctors')) {
      req.body.doctors.forEach(async function (doctor) {
        if (secretary.doctors.indexOf(doctor) === -1) {
          promises.push(secretary.assignDoctor(doctor));
        }
      });
    }
    secretary.doctors.forEach(async function (doctor) {
      if (req.body.doctors.indexOf(doctor) === -1) {
        promises.push(secretary.removeDoctor(doctor));
      }
    });
    await Promise.all([...promises, secretary.save()]);
    delete req.body.password;
    res.status(200).json(req.body);
  }
  catch (error) {
    switch (error.code) {
      case errors.secretaryNotFound.code:
        log(error, {username});
        res.status(404).send({error});
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

async function readSecretary(req, res) {
  let username = req.params.username;
  try {
    checkUserIsSecretaryOrAdmin(req);
    let secretary = await new Secretary({username});
    res.status(200).json({
      username: secretary.username,
      name: secretary.name,
      family: secretary.family,
      doctors: secretary.doctors
    });
  }
  catch (error) {
    switch (error.code) {
      case errors.secretaryNotFound.code:
        log(error, {username});
        res.status(404).send({error});
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

async function readSecretaries(req, res, next) {
  try {
    checkUserIsAdmin(req);
    let secretaries = await Secretary.getAll();
    res.status(200).json({secretaries});
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

async function deleteSecretary(req, res) {
  let username = req.params.username;
  try {
    checkUserIsAdmin(req);
    let secretary = await new Secretary({username});
    await secretary.remove();
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.secretaryNotFound.code:
        log(error, {username});
        res.status(404).send({error});
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

async function deleteSecretaries(req, res, next) {
  try {
    checkUserIsAdmin(req);
    await Secretary.removeSecretaries(req.body);
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
        res.status(500).send({error: errors.internalServerError});
    }
  }
}

function checkUserIsAdmin(req) {
  if (!req.session.username || req.session.type !== Admin.type) {
    throw errors.accessDenied;
  }
}

function checkUserIsSecretaryOrAdmin(req) {
  if (!req.session.username || (req.session.type !== Admin.type && req.session.type !== Secretary.type)) {
    throw errors.accessDenied;
  }
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}