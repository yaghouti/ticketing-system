let Admin = require('../models/admin');
let Doctor = require('../models/doctor');
let Secretary = require('../models/secretary');
let Patient = require('../models/patient');
let MedicalRecord = require('../models/medicalRecord');
let errors = require("../configs/errors");

module.exports = [
  {method: 'post', route: '/patients', controller: createPatient},
  {method: 'put', route: '/patients/:username', controller: updatePatient},
  {method: 'get', route: '/patients/:username', controller: readPatient},
  {method: 'get', route: '/patients', controller: readPatients},
  {method: 'delete', route: '/patients/:username', controller: deletePatient},
  {method: 'delete', route: '/patients', controller: deletePatients},
  {method: 'get', route: '/patients/:username/medicalRecords/:id', controller: readMedicalRecord},
  {method: 'put', route: '/patients/:username/medicalRecords/:id', controller: setMedicalRecordValues},
  {method: 'delete', route: '/patients/:username/medicalRecords/:id', controller: deleteMedicalRecord},
  {method: 'get', route: '/patients/:username/medicalRecords', controller: readMedicalRecords},
  {method: 'post', route: '/patients/:username/medicalRecords', controller: createMedicalRecord}
];

async function createPatient(req, res, next) {
  try {
    let patient = await new Patient({
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      family: req.body.family,
      phone: req.body.phone,
      avatar: req.body.avatar
    });
    res.status(200).json({docId: patient.docId});
  }
  catch (error) {
    switch (error.code) {
      case errors.patientAlreadyExists.code:
        log(error, {username: req.body.username});
        res.status(409).send({error: error});
        break;
      default:
        log(errors.internalServerError, error);
        res.status(500).send({error: errors.internalServerError});
    }
  }
}

async function updatePatient(req, res, next) {
  let username = req.params.username;
  try {
    checkUserIsPatient(req);
    let patient = await new Patient({username});
    if (req.body.hasOwnProperty('name')) patient.name = req.body.name;
    if (req.body.hasOwnProperty('family')) patient.family = req.body.family;
    if (req.body.hasOwnProperty('phone')) patient.phone = req.body.phone;
    if (req.body.hasOwnProperty('avatar')) patient.avatar = req.body.avatar;
    if (req.body.hasOwnProperty('password')) patient.password = req.body.password;
    await patient.save();
    delete req.body.password;
    res.status(200).json(req.body);
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
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

async function readPatient(req, res) {
  let username = req.params.username;
  try {
    checkUserIsPatient(req);
    let patient = await new Patient({username});
    res.status(200).json({
      username: patient.username,
      docId: patient.docId,
      name: patient.name,
      family: patient.family,
      phone: patient.phone,
      avatar: patient.avatar
    });
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
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

async function readPatients(req, res, next) {
  try {
    checkUserIsAdmin(req);
    let patients = await Patient.getAll();
    res.status(200).json({patients});
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

async function deletePatient(req, res) {
  let username = req.params.username;
  try {
    checkUserIsAdmin(req);
    let patient = await new Patient({username});
    await patient.remove();
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
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

async function deletePatients(req, res, next) {
  try {
    checkUserIsAdmin(req);
    await Patient.removePatients(req.body);
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

async function readMedicalRecord(req, res) {
  let patient = req.params.username;
  let medicalRecordId = Number(req.params.id);
  try {
    checkUserIsDoctorOrSecretary(req);
    let medicalRecord = await new MedicalRecord({patient, id: medicalRecordId});
    res.status(200).json({
      id: medicalRecord.id,
      patient: medicalRecord.patient,
      doctor: medicalRecord.doctor,
      tests: medicalRecord.tests,
      drugs: medicalRecord.drugs,
      date: medicalRecord.date,
      time: medicalRecord.time
    });
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
        log(error, {patient});
        res.status(404).send({error});
        break;
      case errors.medicalRecordNotFound.code:
        log(error, {patient, medicalRecordId});
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

async function setMedicalRecordValues(req, res) {
  let patient = req.params.username;
  let medicalRecordId = Number(req.params.id);
  try {
    checkUserIsDoctorOrSecretary(req);
    let medicalRecord = await new MedicalRecord({patient, id: Number(medicalRecordId)});
    updateMedicalRecordTestsBasedOnInput(medicalRecord, req.body);
    updateMedicalRecordDrugsBasedOnInput(medicalRecord, req.body);
    await medicalRecord.save();
    res.status(200).json({
      id: medicalRecord.id,
      patient: medicalRecord.patient,
      doctor: medicalRecord.doctor,
      tests: medicalRecord.tests,
      drugs: medicalRecord.drugs,
      date: medicalRecord.date,
      time: medicalRecord.time
    });
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
        log(error, {patient});
        res.status(404).send({error});
        break;
      case errors.medicalRecordNotFound.code:
        log(error, {patient, medicalRecordId});
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

  function updateMedicalRecordTestsBasedOnInput(medicalRecord, input) {
    if (input.hasOwnProperty('tests')) {
      for (let test in input.tests) {
        if (input.tests.hasOwnProperty(test) && medicalRecord.tests.hasOwnProperty(test)) {
          for (let field in input.tests[test]) {
            if (input.tests[test].hasOwnProperty(field) && medicalRecord.tests[test].hasOwnProperty(field)) {
              medicalRecord.tests[test][field] = input.tests[test][field];
            }
          }
        }
      }
    }
  }

  function updateMedicalRecordDrugsBasedOnInput(medicalRecord, input) {
    if (input.hasOwnProperty('drugs')) {
      for (let drug in input.drugs) {
        if (input.drugs.hasOwnProperty(drug) && medicalRecord.drugs.hasOwnProperty(drug)) {
          medicalRecord.drugs[drug] = input.drugs[drug];
        }
      }
    }
  }
}

async function deleteMedicalRecord(req, res) {
  let patient = req.params.username;
  let medicalRecordId = Number(req.params.id);
  try {
    checkUserIsDoctor(req);
    let medicalRecord = await new MedicalRecord({patient, id: medicalRecordId});
    medicalRecord.remove();
    res.status(200).json({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
        log(error, {patient});
        res.status(404).send({error});
        break;
      case errors.medicalRecordNotFound.code:
        log(error, {patient, medicalRecordId});
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

async function readMedicalRecords(req, res, next) {
  let patient = req.params.username;
  let username;
  try {
    checkUserIsDoctorOrSecretary(req);
    username = getUsername(req);
    let type = getUserType(req);
    let medicalRecords;
    if (type === Doctor.type) {
      medicalRecords = await MedicalRecord.getByPatient(patient);
    }
    else if (type === Secretary.type) {
      let secretary = await new Secretary({username});
      medicalRecords = await MedicalRecord.getByPatient(patient);
      for (let i = 0; i < medicalRecords.length; i++) {
        if (secretary.doctors.indexOf(medicalRecords[i].doctor) === -1) {
          medicalRecords.splice(i--, 1);
        }
      }
    }
    res.status(200).json({medicalRecords});
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
        log(error, {patient});
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

async function createMedicalRecord(req, res) {
  let patient = req.params.username;
  try {
    checkUserIsDoctor(req);
    let doctor = getUsername(req);
    let medicalRecord = {
      patient,
      doctor,
      tests: req.body.tests || [],
      drugs: req.body.drugs || {}
    };
    let newMedicalRecord = await new MedicalRecord(medicalRecord);
    res.status(200).json({
      id: newMedicalRecord.id,
      patient: newMedicalRecord.patient,
      doctor: newMedicalRecord.doctor,
      tests: newMedicalRecord.tests,
      drugs: newMedicalRecord.drugs,
      date: newMedicalRecord.date,
      time: newMedicalRecord.time
    });
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
        log(error, {patient});
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

function checkUserIsDoctor(req) {
  if (!req.session.username || req.session.type !== Doctor.type) {
    throw errors.accessDenied;
  }
}

function checkUserIsAdmin(req) {
  if (!req.session.username || req.session.type !== Admin.type) {
    throw errors.accessDenied;
  }
}

function checkUserIsDoctorOrSecretary(req) {
  if (!req.session.username || (req.session.type !== Doctor.type && req.session.type !== Secretary.type)) {
    throw errors.accessDenied;
  }
}

function checkUserIsPatient(req) {
  if (!req.session.username || req.session.type !== Patient.type) {
    throw errors.accessDenied;
  }
}

function getUsername(req) {
  return req.session.username || null;
}

function getUserType(req) {
  return req.session.type || null;
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}