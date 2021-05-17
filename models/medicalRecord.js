let moment = require('jalali-moment');
let MedicalTest = require('./medicalTest');
let Patient = require('./patient');
let Doctor = require('./doctor');
let Drug = require('./drug');
let mongodb = require('../configs/mongodb');
let errors = require("../configs/errors");
moment.locale('fa');

class MedicalRecord {
  constructor(medicalRecord) {
    let self = this;
    return new Promise(async(resolve, reject) => {
      try {
        let patient = await new Patient({username: medicalRecord.patient});
        if (medicalRecordIsNew()) {
          self._patient = medicalRecord.patient;
          self.doctor = medicalRecord.doctor;
          await Promise.all([
            getIdForNewMedicalRecord(patient),
            putMedicalTestsInRecord(),
            putDrugsInRecord()
          ]);
          let now = moment();
          self.date = now.format('YYYY/MM/DD');
          self.time = now.format('HH:mm');
          await self._create();
          let time = new Date();
          console.log(time, `<Medical record for ${self._patient} created!>`);
          resolve(self);
        }
        else {
          self._patient = medicalRecord.patient;
          self._id = medicalRecord.id;
          await self._load();
          resolve(self);
        }
      }
      catch (e) {
        reject(e);
      }
    });

    function medicalRecordIsNew() {
      return !medicalRecord.hasOwnProperty('id');
    }

    async function putMedicalTestsInRecord() {
      let medicalTests = await MedicalTest.getAll(medicalRecord.tests);
      self.tests = {};
      medicalTests.forEach(function (medicalTest) {
        let test = {};
        medicalTest.fields.forEach(function (field) {
          test[field] = null;
        });
        self.tests[medicalTest.name] = test;
      });
    }

    async function putDrugsInRecord() {
      let drugs = await Drug.getAll(Object.keys(medicalRecord.drugs));
      self.drugs = {};
      drugs.forEach(function (drug) {
        self.drugs[drug.name] = medicalRecord.drugs[drug.name] || null;
      });
    }

    async function getIdForNewMedicalRecord(patient) {
      self._id = await patient.generateMedicalRecordId();
    }
  }

  get id() {
    return this._id;
  }

  get patient() {
    return this._patient;
  }

  set doctor(username) {
    this._doctor = username;
  }

  get doctor() {
    return this._doctor;
  }

  set tests(tests) {
    this._tests = tests;
  }

  get tests() {
    return this._tests;
  }

  set drugs(drugs) {
    this._drugs = drugs;
  }

  get drugs() {
    return this._drugs;
  }

  get date() {
    return this._date;
  }

  set date(date) {
    return this._date = date;
  }

  get time() {
    return this._time;
  }

  set time(time) {
    return this._time = time;
  }

  async save() {
    let self = this;
    try {
      let dbObj = await
        mongodb.getDbObject();
      let query = {patient: self.patient, id: self.id};
      let updateExp = {$set: {tests: self.tests, drugs: self.drugs}};
      let updatedCount = await dbObj.collection('medicalRecords').updateOne(query, updateExp);
      if (!updatedCount) {
        handleError(errors.medicalRecordNotFound, {patient: self.patient, id: self.id});
      }
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors.medicalRecordNotFound.code) {
        throw e;
      }
      handleError(errors.updateMedicalRecordError, {patient: self.patient, id: self.id, e});
    }
  }

  async _load() {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {patient: self.patient, id: self.id};
      let loadedMedicalRecord = await dbObj.collection('medicalRecords').findOne(query);
      if (!loadedMedicalRecord) {
        handleError(errors.medicalRecordNotFound, {id: self.id});
      }
      self.doctor = loadedMedicalRecord.doctor;
      self.tests = loadedMedicalRecord.tests;
      self.drugs = loadedMedicalRecord.drugs;
      self.date = loadedMedicalRecord.date;
      self.time = loadedMedicalRecord.time;
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors.medicalRecordNotFound.code) {
        throw e;
      }
      handleError(errors.fetchMedicalRecordError, {e});
    }
  }

  async _create() {
    let self = this;
    try {
      let medicalRecord = {
        id: self.id,
        patient: self.patient,
        doctor: self.doctor,
        tests: self.tests,
        drugs: self.drugs,
        date: self.date,
        time: self.time
      };

      let dbObj = await mongodb.getDbObject();
      return dbObj.collection('medicalRecords').insertOne(medicalRecord);
    }
    catch (e) {
      handleError(errors.createMedicalRecordError, {e});
    }
  }

  async remove() {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {patient: self.patient, id: self.id};
      let deletedCount = await dbObj.collection('medicalRecords').deleteOne(query);
      if (!deletedCount) {
        handleError(errors.medicalRecordNotFound, {patient: self.patient, id: self.id});
      }
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors.medicalRecordNotFound.code) {
        throw e;
      }
      handleError(errors.removeMedicalRecordError, {name: self._name, e});
    }
  }

  static async getAll() {
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {};
      let projection = {_id: 0};
      return await dbObj.collection('medicalRecords').find(query).project(projection).toArray();
    }
    catch (e) {
      handleError(errors.fetchMedicalRecordError, {e});
    }
  }

  static async getByPatient(patient) {
    try {
      Patient.checkExistence(patient);
      let dbObj = await mongodb.getDbObject();
      let query = {patient};
      let projection = {_id: 0};
      return await dbObj.collection('medicalRecords').find(query).project(projection).toArray();
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors.patientNotFound.code) {
        throw e;
      }
      handleError(errors.fetchMedicalRecordError, {e});
    }
  }

  static async getByDoctor(doctor) {
    try {
      Doctor.checkExistence(doctor);
      let dbObj = await mongodb.getDbObject();
      let query = {doctor};
      let projection = {_id: 0};
      return await dbObj.collection('medicalRecords').find(query).project(projection).toArray();
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors.doctorNotFound.code) {
        throw e;
      }
      handleError(errors.fetchMedicalRecordError, {e});
    }
  }
}

function handleError(errorObj, additionalInfo) {
  log(errorObj, additionalInfo);
  throw errorObj;
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}

module.exports = MedicalRecord;