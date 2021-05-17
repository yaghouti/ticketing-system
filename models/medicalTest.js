let mongodb = require('../configs/mongodb');
let errors = require("../configs/errors");

class MedicalTest {
  constructor(medicalTest) {
    let self = this;
    return new Promise(async(resolve, reject) => {
      try {
        if (medicalTestIsNew()) {
          self._name = medicalTest.name;
          self._fields = medicalTest.fields;
          await self._create();
          let time = new Date();
          console.log(time, `<Medical test ${self._name} created!>`);
          resolve(self);
        }
        else {
          self._name = medicalTest.name;
          await self._load();
          resolve(self);
        }
      }
      catch (e) {
        reject(e);
      }
    });

    function medicalTestIsNew() {
      return Object.keys(medicalTest).length !== 1;
    }
  }

  get name(){
    return this._name;
  }

  set fields(fields) {
    this._fields = fields;
  }

  get fields() {
    return this._fields;
  }

  async save() {
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {name: this._name};
      let updateExp = {$set: {fields: this._fields}};
      await executeUpdate(dbObj, query, updateExp);
    }
    catch (e){
      if (e.hasOwnProperty('code') && e.code === errors.medicalTestNotFound.code) {
        throw e;
      }
      handleError(errors.updateMedicalTestError, {name: this._name, e});
    }

    async function executeUpdate(dbObj, query, updateExp) {
      let updatedCount = await dbObj.collection('medicalTests').updateOne(query, updateExp);
      if (!updatedCount) {
        throw errors.medicalTestNotFound;
      }
    }

  }

  async _load() {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {name: self.name};
      let projection = {_id: 0};
      let loadedMedicalTest = await dbObj.collection('medicalTests').findOne(query, projection);
      if (!loadedMedicalTest) {
        handleError(errors.medicalTestNotFound, {name: self.name});
      }
      self._name = loadedMedicalTest.name;
      self.fields = loadedMedicalTest.fields;
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors.medicalTestNotFound.code) {
        throw e;
      }
      handleError(errors.fetchMedicalTestError, {e});
    }
  }

  async _create() {
    let self = this;
    try {
      await checkMedicalTestExistence();
      await storeMedicalTestInDb();
      return self;
    }
    catch (e) {
      throw e;
    }

    async function checkMedicalTestExistence() {
      let dbObj = await mongodb.getDbObject();
      let query = {name: self.name};
      let projection = {_id: 1};
      let existingMedicalTest = await dbObj.collection('medicalTests').findOne(query, projection);
      if (existingMedicalTest) {
        throw errors.medicalTestAlreadyExists;
      }
    }

    async function storeMedicalTestInDb() {
      try {
        let medicalTest = {
          name: self.name,
          fields: self.fields
        };

        let dbObj = await mongodb.getDbObject();
        return dbObj.collection('medicalTests').insertOne(medicalTest);
      }
      catch (e) {
        handleError(errors.createMedicalTestError, {e});
      }
    }
  }

  async remove() {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {name: self.name};
      let deletedCount = await dbObj.collection('medicalTests').deleteOne(query);
      if (!deletedCount) {
        handleError(errors.medicalTestNotFound, {name: self.name});
      }
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors.medicalTestNotFound.code) {
        throw e;
      }
      handleError(errors.removeMedicalTestError, {name: self._name, e});
    }
  }

  static async removeMedicalTests(medicalTests) {
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {name: {$in: medicalTests}};
      await dbObj.collection('medicalTests').deleteMany(query);
    }
    catch (e) {
      handleError(errors.removeMedicalTestError, {medicalTests, e});
    }
  }

  static async getAll(names) {
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {};
      if (names) {
        query.name = {$in: names};
      }
      let projection = {_id: 0};
      return await dbObj.collection('medicalTests').find(query).project(projection).toArray();
    }
    catch (e) {
      handleError(errors.fetchMedicalTestError, {e});
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

module.exports = MedicalTest;