let Admin = require('../models/admin');
let Patient = require('../models/patient');
let Doctor = require('../models/doctor');
let Secretary = require('../models/secretary');
let errors = require("../configs/errors");

module.exports = [
  {method: 'get', route: '/profile', controller: readProfile}
];

async function readProfile(req, res) {
  let username, type;
  try {
    checkUserHasLoggedIn(req);
    username = getUsername(req);
    type = getUserType(req);
    let user, profile;
    switch (type) {
      case Patient.type:
        user = await new Patient({username});
        profile = {
          username: user.username,
          docId: user.docId,
          name: user.name,
          family: user.family,
          phone: user.phone,
          avatar: user.avatar
        };
        break;
      case Doctor.type:
        user = await new Doctor({username});
        profile = {
          username: user.username,
          name: user.name,
          family: user.family
        };
        break;
      case Secretary.type:
        user = await new Secretary({username});
        profile = {
          username: user.username,
          name: user.name,
          family: user.family,
          doctors: user.doctors
        };
        break;
      case Admin.type:
        user = await new Admin({username});
        profile = {
          username: user.username,
          name: user.name,
          family: user.family
        };
        break;
      default:
        log(errors.accessDenied, {username, type});
        return res.status(403).send({error: errors.accessDenied});
    }
    res.status(200).json(profile);
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
        log(error, {username: username || null});
        res.status(404).send({error});
        break;
      case errors.accessDenied.code:
        log(error, {username: username || null});
        res.status(403).send({error});
        break;
      default:
        log(errors.internalServerError, error);
        res.status(500).send({error: errors.internalServerError});
    }
  }
}

function checkUserHasLoggedIn(req) {
  if (!req.session.username) {
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