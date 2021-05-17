let Doctor = require('../models/doctor');
let Secretary = require('../models/secretary');
let MedicalTest = require('../models/medicalTest');
let errors = require("../configs/errors");

module.exports = [
  {method: 'post', route: '/medicalTests', controller: createMedicalTest},
  {method: 'put', route: '/medicalTests/:name', controller: updateMedicalTest},
  {method: 'get', route: '/medicalTests/:name', controller: readMedicalTest},
  {method: 'get', route: '/medicalTests', controller: readMedicalTests},
  {method: 'delete', route: '/medicalTests/:name', controller: deleteMedicalTest},
  {method: 'delete', route: '/medicalTests', controller: deleteMedicalTests}
];

async function createMedicalTest(req, res, next) {
  let name = req.body.name;
  try {
    checkUserIsDoctor(req);
    await new MedicalTest({
      name: req.body.name,
      fields: req.body.fields || []
    });
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.medicalTestAlreadyExists.code:
        log(error, {name});
        res.status(409).send({error});
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

async function updateMedicalTest(req, res, next) {
  let name = req.params.name;
  let fields = req.body.fields;
  try {
    checkUserIsDoctor(req);
    let medicalTest = await new MedicalTest({name});
    if (req.body.hasOwnProperty('fields'))  medicalTest.fields = fields;
    await medicalTest.save();
    res.status(200).json({fields});
  }
  catch (error) {
    switch (error.code) {
      case errors.medicalTestNotFound.code:
        log(error, {name});
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

async function readMedicalTest(req, res) {
  let name = req.params.name;
  try {
    checkUserIsDoctorOrSecretary(req);
    let medicalTest = await new MedicalTest({name});
    res.status(200).json({
      name: medicalTest.name,
      fields: medicalTest.fields
    });
  }
  catch (error) {
    switch (error.code) {
      case errors.medicalTestNotFound.code:
        log(error, {name});
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

async function readMedicalTests(req, res, next) {
  try {
    checkUserIsDoctorOrSecretary(req);
    let medicalTests = await MedicalTest.getAll();
    res.status(200).json({medicalTests});
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

async function deleteMedicalTest(req, res, next) {
  let name = req.params.name;
  try {
    checkUserIsDoctor(req);
    let medicalTest = await new MedicalTest({name});
    await medicalTest.remove();
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.medicalTestNotFound.code:
        log(error, {name});
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

async function deleteMedicalTests(req, res, next) {
  try {
    checkUserIsDoctor(req);
    await MedicalTest.removeMedicalTests(req.body);
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