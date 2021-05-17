let crypto = require('crypto');
let mongodb = require('../configs/mongodb');
let errors = require("../configs/errors");

class User {
  constructor(user) {
    let self = this;
    if (user.hasOwnProperty('password')) {
      user.password = hash(user.password);
    }
    self.fields = user;
    if (Object.keys(user).length === 1) {
      return new Promise(async(resolve, reject) => {
        try {
          await self._load();
          resolve(self);
        }
        catch (e) {
          return reject(e);
        }
      });
    }
    else {
      return new Promise(async(resolve, reject) => {
        try {
          await self._create();
          let time = new Date();
          console.log(time, `<${self.type} ${self.username} created!>`);
          resolve(self);
        }
        catch (e) {
          reject(e);
        }
      });
    }
  }

  get username() {
    return this._fields.username;
  }

  set name(name) {
    this._fields.name = name;
  }

  get name() {
    return this._fields.name;
  }

  set family(family) {
    this._fields.family = family;
  }

  get family() {
    return this._fields.family;
  }

  set password(password) {
    this._fields.password = hash(password);
  }

  get password() {
    return this._fields.password;
  }

  set type(type) {
    this._type = type;
  }

  get type() {
    return this._type;
  }

  get fields() {
    return this._fields;
  }

  set fields(fields) {
    this._fields = fields;
  }

  async save() {
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {type: this.type, 'fields.username': this.username};
      let updateExp = {$set: {fields: {...this.fields}}};
      await dbObj.collection('users').updateOne(query, updateExp);
    }
    catch (e) {
      handleError(errors[`update${this.type}Error`], {e});
    }
  }

  async _load() {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {type: self.type, 'fields.username': self.username};
      let projection = {_id: 0};
      let loadedUser = await dbObj.collection('users').findOne(query, projection);
      if (!loadedUser) {
        handleError(errors[`${self.type.toLowerCase()}NotFound`], {username: self.username});
      }
      self.fields = loadedUser.fields;
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors[`${self.type.toLowerCase()}NotFound`].code) {
        throw e;
      }
      handleError(errors[`fetch${self.type}Error`], {username: self.username, e});
    }
  }

  async _create() {
    let self = this;
    try {
      await checkUserExistence();
      await storeUserInDb();
      return self;
    }
    catch (e) {
      throw e;
    }

    async function checkUserExistence() {
      try {
        let dbObj = await mongodb.getDbObject();
        let query = {
          type: self.type,
          'fields.username': self.username
        };
        let existingUser = await dbObj.collection('users').findOne(query);
        if (existingUser) {
          handleError(errors[`${self.type.toLowerCase()}AlreadyExists`], {username: self.username});
        }
      }
      catch (e) {
        if (e.hasOwnProperty('code') && e.code === errors[`${self.type.toLowerCase()}AlreadyExists`].code) {
          throw e;
        }
        handleError(errors[`fetch${self.type}Error`], {username: self.username, e})
      }
    }

    async function storeUserInDb() {
      try {
        let dbObj = await mongodb.getDbObject();
        let user = {type: self.type, fields: {...self.fields}};
        return await dbObj.collection('users').insertOne(user);
      }
      catch (e) {
        handleError(errors[`create${self.type}Error`], {e});
      }
    }
  }

  async remove() {
    let self = this;
    try {
      await deleteUserFromDb();
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors[`${self.type.toLowerCase()}NotFound`].code) {
        throw e;
      }
      handleError(errors[`remove${self.type}Error`], {username: self.username, e});
    }

    async function deleteUserFromDb() {
      let dbObj = await mongodb.getDbObject();
      let query = {type: self.type, 'fields.username': self.username};
      let deletedCount = await dbObj.collection('users').deleteOne(query);
      if (!deletedCount) {
        handleError(errors[`${self.type.toLowerCase()}NotFound`], {username: self.username});
      }
    }
  }

  matchPassword(password){
    return this.password === hash(password);
  }

  static async removeUsers(users) {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {type: self.type, 'fields.username': {$in: users}};
      await dbObj.collection('users').deleteMany(query);
    }
    catch (e) {
      handleError(errors[`remove${self.type}Error`], {users, e});
    }
  }

  static async getAll() {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {type: self.type};
      let projection = {_id: 0, 'fields.password': 0};
      let users = await dbObj.collection('users').find(query).project(projection).toArray();
      return users.map(function (user) {
        return user.fields;
      });
    }
    catch (e) {
      handleError(errors[`fetch${self.type}Error`], {e});
    }
  }

  static async checkExistence(username) {
    let self = this;
    try {
      let dbObj = await mongodb.getDbObject();
      let query = {type: self.type, 'fields.username': username};
      let count = await dbObj.collection('users').countDocuments(query);
      if (!count) {
        handleError(errors[`${self.type.toLowerCase()}NotFound`], {username});
      }
    }
    catch (e) {
      if (e.hasOwnProperty('code') && e.code === errors[`${self.type.toLowerCase()}NotFound`].code) {
        throw e;
      }
      handleError(errors[`fetch${self.type}Error`], {e});
    }
  }
}

function hash(password) {
  return crypto.createHash('sha512').update(password).digest('hex').toUpperCase();
}

function handleError(errorObj, additionalInfo) {
  log(errorObj, additionalInfo);
  throw errorObj;
}

function log(errorObj, additionalInfo) {
  let time = new Date() + '';
  console.error(time, errorObj.code, errorObj.message, additionalInfo ? '\n  |_ Additional Info:' : '', additionalInfo ? additionalInfo : '');
}

module.exports = User;