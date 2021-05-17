let Admin = require('../models/admin');
let Doctor = require('../models/doctor');
let Secretary = require('../models/secretary');
let errors = require("../configs/errors");

module.exports = [
  {method: 'post', route: '/doctors', controller: createDoctor},
  {method: 'put', route: '/doctors/:username', controller: updateDoctor},
  {method: 'get', route: '/doctors/:username', controller: readDoctor},
  {method: 'get', route: '/doctors', controller: readDoctors},
  {method: 'delete', route: '/doctors/:username', controller: deleteDoctor},
  {method: 'delete', route: '/doctors', controller: deleteDoctors}
];

async function createDoctor(req, res, next) {
  try {
    checkUserIsAdmin(req);
    await new Doctor({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      family: req.body.family,
      specialties: req.body.specialties || [],
      attendanceTimes: []
    });
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.doctorAlreadyExists.code:
        log(error, {username: req.body.username});
        res.status(409).send({error: error});
        break;
      case errors.accessDenied.code:
        log(error, {type: req.session.type, username: req.session.username});
        res.status(403).send({error: error});
        break;
      default:
        log(errors.internalServerError, error);
        res.status(500).send({error: errors.internalServerError});
    }
  }
}

async function updateDoctor(req, res, next) {
  let username = req.params.username;
  try {
    checkUserIsDoctorOrAdmin(req);
    let doctor = await new Doctor({username});
    if (req.body.hasOwnProperty('password')) doctor.password = req.body.password;
    if (req.body.hasOwnProperty('name')) doctor.name = req.body.name;
    if (req.body.hasOwnProperty('family')) doctor.family = req.body.family;
    if (req.body.hasOwnProperty('specialties')) doctor.specialties = req.body.specialties;
    await doctor.save();
    delete req.body.password;
    res.status(200).json(req.body);
  }
  catch (error) {
    switch (error.code) {
      case errors.doctorNotFound.code:
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

async function readDoctor(req, res) {
  let username = req.params.username;
  try {
    checkUserIsDoctorOrAdmin(req);
    let doctor = await new Doctor({username});
    res.status(200).json({...doctor.fields});
  }
  catch (error) {
    switch (error.code) {
      case errors.doctorNotFound.code:
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

async function readDoctors(req, res, next) {
  try {
    checkUserHasLoggedIn(req);
    let doctors = await Doctor.getAll();
    res.status(200).json({doctors});
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

async function deleteDoctor(req, res) {
  let username = req.params.username;
  try {
    checkUserIsAdmin(req);
    let doctor = await new Doctor({username});
    await doctor.remove();
    await Secretary.removeDoctors([username]);
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.doctorNotFound.code:
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

async function deleteDoctors(req, res, next) {
  try {
    checkUserIsAdmin(req);
    await Doctor.removeDoctors(req.body);
    await Secretary.removeDoctors(req.body);
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

function checkUserHasLoggedIn(req) {
  if (!req.session.username) {
    throw errors.accessDenied;
  }
}

function checkUserIsDoctorOrAdmin(req) {
  if (!req.session.username || (req.session.type !== Admin.type && req.session.type !== Doctor.type)) {
    throw errors.accessDenied;
  }
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}