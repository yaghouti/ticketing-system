let crypto = require('crypto');
let Admin = require('../models/admin');
let Patient = require('../models/patient');
let Secretary = require('../models/secretary');
let Doctor = require('../models/doctor');
let errors = require("../configs/errors");

module.exports = [
  {method: 'post', route: '/auth/login', controller: login},
  {method: 'get', route: '/auth/logout', controller: logout}
];

async function login(req, res) {
  let username = req.body.username;
  let type = req.body.type;
  try {
    let user = await loadUser(type, username);
    await checkPasswordMatch(user, req.body.password);
    createSession(req, {type, username});
    redirectToPanel(req, res);
  }
  catch (error) {
    switch (error.code) {
      case errors.wrongUserPass.code:
        log(error, {username, type, error});
        res.status(401).send({error});
        break;
      default:
        log(errors.internalServerError, {error});
        res.status(500).send({error: errors.internalServerError});
    }
  }
}

async function logout(req, res) {
  let {type, username} = req.session;
  try {
    await destroySession(req.session);
    res.json({
      location: '/'
    });
  }
  catch (e) {
    log(errors.sessionDestroyError, {type, username, e});
    return res.status(500).send({error: errors.internalServerError});
  }
}

function redirectToPanel(req, res) {
  switch (req.body.type) {
    case 'Patient':
      res.status(200).json({location: 'patient.html'});
      break;
    case 'Secretary':
      res.status(200).json({location: 'secretary.html'});
      break;
    case 'Doctor':
      res.status(200).json({location: 'doctor.html'});
      break;
    case 'Admin':
      res.status(200).json({location: 'admin.html'});
      break;
    default:
      req.status(400).send({error: errors.invalidLoginData});
  }
}

async function loadUser(type, username) {
  try {
    let user;
    switch (type) {
      case 'Patient':
        user = await new Patient({username});
        break;
      case 'Secretary':
        user = await new Secretary({username});
        break;
      case 'Doctor':
        user = await new Doctor({username});
        break;
      case 'Admin':
        user = await new Admin({username});
        break;
      default:
    }

    return user;
  }
  catch (error) {
    switch (error.code) {
      case errors.patientNotFound.code:
      case errors.secretaryNotFound.code:
      case errors.doctorNotFound.code:
        log(error, {type, username});
        throw errors.wrongUserPass;
        break;
      default:
        log(errors.internalServerError, error);
        throw errors.internalServerError;
    }
  }
}

async function checkPasswordMatch(user, inputPassword) {
  if (!user.matchPassword(inputPassword)) {
    throw errors.wrongUserPass;
  }
}

function createSession(req, sessionData) {
  for (let key in sessionData) {
    if (sessionData.hasOwnProperty(key)) {
      req.session[key] = sessionData[key];
    }
  }
}

async function destroySession(session) {
  return new Promise((resolve, reject) => {
    session.destroy((error) => {
      if (error) {
        return reject(error);
      }
      resolve();
    });
  })
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time,
    errorObj.code, errorObj.message,
    additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : ''
  );
}