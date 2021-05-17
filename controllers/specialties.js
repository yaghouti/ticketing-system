let Admin = require('../models/admin');
let Specialty = require('../models/specialty');
let errors = require("../configs/errors");

module.exports = [
  {method: 'post', route: '/specialties', controller: createSpecialty},
  {method: 'get', route: '/specialties', controller: readSpecialties},
  {method: 'delete', route: '/specialties/:name', controller: deleteSpecialty},
  {method: 'delete', route: '/specialties', controller: deleteSpecialties}
];

async function createSpecialty(req, res, next) {
  let name = req.body.name;
  try {
    checkUserIsAdmin(req);
    let specialty = new Specialty(name);
    await specialty.save();
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.specialtyAlreadyExists.code:
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

async function readSpecialties(req, res, next) {
  try {
    let specialties = await Specialty.getAll();
    res.status(200).json({specialties});
  }
  catch (error) {
    res.status(500).send({error: errors.internalServerError});
  }
}

async function deleteSpecialty(req, res, next) {
  let name = req.params.name;
  try {
    checkUserIsAdmin(req);
    let specialty = new Specialty(name);
    await specialty.remove();
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.specialtyNotFound.code:
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

async function deleteSpecialties(req, res, next) {
  try {
    checkUserIsAdmin(req);
    await Specialty.removeSpecialties(req.body);
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

function checkUserIsAdmin(req) {
  if (!req.session.username || req.session.type !== Admin.type) {
    throw errors.accessDenied;
  }
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}