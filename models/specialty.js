let mongodb = require('../configs/mongodb');
let errors = require("../configs/errors");

class Specialty {
  constructor(name) {
    this._name = name;
  }

  async save() {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      await checkSpecialtyExistence(dbObj);
      await storeSpecialtyInDb(dbObj);
    }
    catch (e) {
      throw e;
    }

    async function checkSpecialtyExistence(dbObj) {
      let existingSpecialty = await dbObj.collection('specialties').findOne({name: self._name});
      if (existingSpecialty) {
        throw errors.specialtyAlreadyExists;
      }
    }

    async function storeSpecialtyInDb(dbObj) {
      try {
        let specialty = {
          name: self._name
        };

        return dbObj.collection('specialties').insertOne(specialty);
      }
      catch (e) {
        handleError(errors.createSpecialtyError, {e});
      }
    }
  }

  async remove() {
    let self = this;
    try {
      await deleteSpecialtyFromDb(self._name);
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors.specialtyNotFound.code) {
        throw e;
      }
      handleError(errors.removeSpecialtyError, {name: self.name, e});
    }

    async function deleteSpecialtyFromDb(name) {
      let dbObj = await mongodb.getDbObject();
      let query = {name};
      let delResult = await dbObj.collection('specialties').deleteOne(query);
      if (!delResult.deletedCount) {
        throw errors.specialtyNotFound;
      }
    }
  }

  static async removeSpecialties(specialties) {
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {name: {$in: specialties}};
      await dbObj.collection('specialties').deleteMany(query);
    }
    catch (e) {
      handleError(errors.removeSpecialtyError, {specialties, e});
    }
  }

  static async getAll() {
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {};
      let projection = {_id: 0};
      return await dbObj.collection('specialties').find(query).project(projection).toArray();
    }
    catch (e) {
      handleError(errors.fetchSpecialtyError, {e});
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

module.exports = Specialty;