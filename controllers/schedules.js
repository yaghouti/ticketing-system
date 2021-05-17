let Doctor = require('../models/doctor');
let errors = require("../configs/errors");

module.exports = [
  {method: 'post', route: '/schedules', controller: saveSchedules},
  {method: 'get', route: '/schedules/:start/:end', controller: readSchedules}
];

async function saveSchedules(req, res, next) {
  try {
    checkUserIsDoctor(req);
    let doctor = await new Doctor({username: req.session.username});
    await doctor.saveSchedule(req.body.start, req.body.end, req.body.weeklySchedule);
    res.status(200).send({status: 'Success'});
  }
  catch (error) {
    switch (error.code) {
      case errors.doctorNotFound.code:
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

async function readSchedules(req, res, next) {
  try {
    checkUserIsDoctor(req);
    let doctor = await new Doctor({username: req.session.username});
    let schedule = await doctor.getSchedule(req.params.start, req.params.end);

    res.status(200).json({schedule});
  }
  catch (error) {
    switch (error.code) {
      case errors.doctorNotFound.code:
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
  if (!req.session.username || !req.session.type === Doctor.type) {
    throw errors.accessDenied;
  }
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}