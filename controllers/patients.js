let errors = require("../configs/errors");

module.exports = [
  {method: 'post', route: '/patients', controller: createPatient},
  {method: 'put', route: '/patients/:username', controller: updatePatient},
  {method: 'get', route: '/patients/:username', controller: readPatient},
  {method: 'get', route: '/patients', controller: readPatients},
  {method: 'delete', route: '/patients/:username', controller: deletePatient},
  {method: 'delete', route: '/patients', controller: deletePatients}
];

async function createPatient(req, res, next) {
  
}

async function updatePatient(req, res, next) {
  
}

async function readPatient(req, res) {
  
}

async function readPatients(req, res, next) {
  
}

async function deletePatient(req, res) {
  
}

async function deletePatients(req, res, next) {
  
}