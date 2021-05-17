let User = require('./user');
let Doctor = require('./doctor');
let mongodb = require('../configs/mongodb');
let errors = require("../configs/errors");

class Secretary extends User {
  constructor(secretary) {
    super(secretary);
  }

  get doctors() {
    return this.fields.doctors;
  }

  static async removeSecretaries(usernames) {
    await super.removeUsers(usernames);
  }

  async assignDoctor(drUsername) {
    try {
      await
        Doctor.checkExistence(drUsername);
      if (this._hasDoctorInList(drUsername)) {
        handleError(errors.secretaryAlreadyHasTheDoctor);
      }
      this.fields.doctors.push(drUsername);
      await this.save();
    }
    catch (e) {
      throw e;
    }
  }

  async removeDoctor(drUsername) {
    let self = this;
    try {
      await Doctor.checkExistence(drUsername);
      checkIfSecretaryHasTheDoctor();
      removeItemFromList(this.fields.doctors, drUsername);
      await this.save();
    }
    catch (e) {
      throw e;
    }

    function checkIfSecretaryHasTheDoctor() {
      if (!self._hasDoctorInList(drUsername)) {
        handleError(errors.secretaryHasNotTheDoctor);
      }
    }

    function removeItemFromList(list, item) {
      list.splice(list.indexOf(item), 1);
    }
  }

  static async removeDoctors(drUsernames) {
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {type: Secretary.type};
      let updateExp = {$pull: {'fields.doctors': {$in: drUsernames}}};
      await dbObj.collection('users').updateMany(query, updateExp, {multi: true})
    }
    catch (e) {
      handleError(errors.removeDoctorError, e)
    }
  }

  _hasDoctorInList(drUsername) {
    return this.fields.doctors.indexOf(drUsername) !== -1;
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

Secretary.prototype.type = Secretary.type = Secretary.name;
module.exports = Secretary;