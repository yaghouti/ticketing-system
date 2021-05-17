let MedicalRecord = require('../models/medicalRecord');
let Patient = require('../models/patient');
let Doctor = require('../models/doctor');
let Secretary = require('../models/secretary');
let errors = require("../configs/errors");

module.exports = [
  {method: 'get', route: '/medicalRecords', controller: readMedicalRecords}
];

async function readMedicalRecords(req, res, next) {
  let username, userType;
  try {
    checkAccess(req);
    username = getUsername(req);
    userType = getUserType(req);
    let medicalRecords;
    if (userType === Patient.type) {
      medicalRecords = await MedicalRecord.getByPatient(username);
    }
    else if (userType === Doctor.type) {
      medicalRecords = await MedicalRecord.getByDoctor(username);
    }
    else if (userType === Secretary.type) {
      let secretary = await new Secretary({username});
      let promises = [];
      secretary.doctors.forEach(function (doctor) {
        promises.push(MedicalRecord.getByDoctor(doctor));
      });

      let result = await Promise.all(promises);
      medicalRecords=[];
      result.forEach(function (recordsOfDoctor) {
        medicalRecords = [...medicalRecords, ...recordsOfDoctor];
      });
    }
    res.status(200).json({medicalRecords});
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
      case errors.doctorNotFound.code:
        log(error, {username, type: userType});
        res.status(409).send({error});
        break;
      case errors.accessDenied.code:
        log(error, {username, type: userType});
        res.status(403).send({error});
        break;
      default:
        log(errors.internalServerError, error);
        res.status(500).send({error: errors.internalServerError});
    }
  }
}

function checkAccess(req) {
  if (!req.session.username || [Patient.type, Doctor.type, Secretary.type].indexOf(req.session.type) === -1) {
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