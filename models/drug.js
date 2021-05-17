let mongodb = require('../configs/mongodb');
let errors = require("../configs/errors");

class Drug {
  constructor(name) {
    this._name = name;
  }

  async save() {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      await checkDrugExistence(dbObj);
      await storeDrugInDb(dbObj);
    }
    catch (e) {
      throw e;
    }

    async function checkDrugExistence(dbObj) {
      let existingDrug = await dbObj.collection('drugs').findOne({name: self._name});
      if (existingDrug) {
        throw errors.drugAlreadyExists;
      }
    }

    async function storeDrugInDb(dbObj) {
      try {
        let drug = {
          name: self._name
        };

        return dbObj.collection('drugs').insertOne(drug);
      }
      catch (e) {
        handleError(errors.createDrugError, {e});
      }
    }
  }

  async remove() {
    let self = this;
    try {
      await deleteDrugFromDb(self._name);
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors.drugNotFound.code) {
        throw e;
      }
      handleError(errors.removeDrugError, {name: self.name, e});
    }

    async function deleteDrugFromDb(name) {
      let dbObj = await mongodb.getDbObject();
      let query = {name};
      let delResult = await dbObj.collection('drugs').deleteOne(query);
      if (!delResult.deletedCount) {
        throw errors.drugNotFound;
      }
    }
  }

  static async removeDrugs(drugs) {
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {name: {$in: drugs}};
      await dbObj.collection('drugs').deleteMany(query);
    }
    catch (e) {
      handleError(errors.removeDrugError, {drugs, e});
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
      return await dbObj.collection('drugs').find(query).project(projection).toArray();
    }
    catch (e) {
      handleError(errors.fetchDrugError, {e});
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

module.exports = Drug;