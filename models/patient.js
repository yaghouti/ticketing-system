let moment = require('jalali-moment');
let config = require('../configs')();
let locker = require('../configs/locker');
let User = require('./user');
let mongodb = require('../configs/mongodb');
let errors = require("../configs/errors");
moment.locale('fa');

class Patient extends User {
  constructor(patient) {
    super(patient);
    let self = this;
    if (patientIsNew()) {
      return new Promise(async(resolve, reject) => {
        try {
          self = await self;
          self.fields.docId = await generateDocId();
          await self.save();
          resolve(self);
        }
        catch (e) {
          return reject(e);
        }
      });
    }

    function patientIsNew() {
      return Object.keys(patient).length !== 1;
    }

    async function generateDocId() {
      try {
        let dbObj = await mongodb.getDbObject();
        let sequenceDoc = await dbObj.collection('system').findOneAndUpdate(
          {_id: 'docId'},
          {$inc: {sequenceValue: 1}},
          {returnNewDocument: true}
        );

        return sequenceDoc.value.sequenceValue;
      }
      catch (e) {
        handleError(errors.docIdGenError, {e});
      }
    }
  }

  set phone(phone) {
    this.fields.phone = phone;
  }

  get phone() {
    return this.fields.phone;
  }

  set avatar(avatar) {
    this.fields.avatar = avatar;
  }

  get avatar() {
    return this.fields.avatar;
  }

  get docId() {
    return this.fields.docId;
  }

  static async removePatients(usernames) {
    await super.removeUsers(usernames);
  }

  async getTickets() {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {patient: self.username};
      let projection = {_id: 0, patient: 0, 'doctor.username': 0};
      let sortBy = {time: 1};
      return await dbObj.collection('tickets').find(query).project(projection).sort(sortBy).toArray();
    }
    catch (e) {
      handleError(errors.fetchTicketsError, {username: self.username, e});
    }
  }

  async assignTicket(doctor, specialty) {
    let self = this;
    let lock;
    try {
      let resource = 'locks:ticketGenerator';
      let lockerMan = await locker.getLocker();
      lock = await lockerMan.lock(resource, config.locker.ttl);
      let dbObj = await mongodb.getDbObject();
      let searchFrom = moment().add(1, 'hour');
      let query = {
        patient: null,
        $or: [
          {date: {$gt: searchFrom.format('YYYY/MM/DD')}},
          {$and: [{date: {$eq: searchFrom.format('YYYY/MM/DD')}}, {time: {$gte: searchFrom.format('HH:mm')}}]}
        ]
      };
      let projection = {_id: 0, patient: 0, 'doctor.username': 0};
      let sort = {date: 1, time: 1};
      if (doctor) {
        query['doctor.username'] = doctor;
      }
      if (specialty) {
        query.specialties = {$elemMatch: {$eq: specialty}};
      }
      let updateExp = {$set: {patient: self.username}};
      let findAndUpdateResult = await dbObj.collection('tickets').findOneAndUpdate(query, updateExp, {
        projection,
        sort,
        new: true
      });
      if (!findAndUpdateResult.value) {
        handleError(errors.noTicketToAssign, {username: self.username});
      }
      return findAndUpdateResult.value;
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors.noTicketToAssign.code) {
        throw e;
      }
      handleError(errors.assignTicketError, {username: self.username, e});
    }
    finally {
      lock && lock.unlock()
        .catch(function (error) {
          log(errors.unlockError, {error});
        });
    }
  }

  async generateMedicalRecordId() {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      let sequenceDoc = await dbObj.collection('users').findOneAndUpdate(
        {type: self.type, 'fields.username': self.username},
        {$inc: {lastMedicalRecordId: 1}},
        {projection: {_id: 0, lastMedicalRecordId: 1}, returnNewDocument: true}
      );
      return 1 + (sequenceDoc.value.lastMedicalRecordId || 0);
    }
    catch (e) {
      handleError(errors.medicalRecordIdGenError, {username: self.username, e});
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

Patient.prototype.type = Patient.type = Patient.name;
module.exports = Patient;