let Patient = require('../models/patient');
let errors = require("../configs/errors");

module.exports = [
  {method: 'post', route: '/tickets', controller: assignTicket},
  {method: 'get', route: '/tickets', controller: getTickets}
];

async function assignTicket(req, res, next) {
  try {
    checkUserIsPatient(req);
    let patient = await new Patient({username: req.session.username});
    let ticket = await patient.assignTicket(req.body.doctor, req.body.specialty);
    res.status(200).send(ticket);
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
      case errors.accessDenied.code:
        log(error, {type: req.session.type, username: req.session.username});
        res.status(403).send({error});
        break;
      case errors.noTicketToAssign.code:
        res.status(404).send({error: error});
        break;
      default:
        res.status(500).send({error: errors.internalServerError});
    }
  }
}

async function getTickets(req, res, next) {
  try {
    checkUserIsPatient(req);
    let patient = await new Patient({username: req.session.username});
    let tickets = await patient.getTickets();

    res.status(200).json({tickets});
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
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

function checkUserIsPatient(req) {
  if (!req.session.username || req.session.type !== Patient.type) {
    throw errors.accessDenied;
  }
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}