let mongodb = require('./configs/mongodb');
let Admin = require('./models/admin');
let errors = require('./configs/errors');

boot();

async function boot() {
  try {
    let dbObj = await mongodb.getDbObject();
    await dbObj.collection('users').createIndex({type: 1, 'fields.username': 1}, {unique: true});
    await dbObj.collection('drugs').createIndex({name: 1}, {unique: true});
    await dbObj.collection('medicalTests').createIndex({name: 1}, {unique: true});
    await dbObj.collection('specialties').createIndex({name: 1}, {unique: true});
    await dbObj.collection('medicalRecords').createIndex({id: 1, patient: 1}, {unique: true});
    let docId = await dbObj.collection('system').findOne({_id: 'docId'});
    if (!docId) {
      await dbObj.collection('system').insertOne({_id: 'docId', sequenceValue: 1000});
    }
    await new Admin({username: 'admin'});
    mongodb.close();
  }
  catch (e) {
    if (e.hasOwnProperty('code') && e.code === errors.adminNotFound.code) {
      await new Admin({
        username: 'admin',
        name: 'ادمین',
        family: '',
        password: '123456'
      });
    }
    else {
      console.log('Mongo error!', e);
      process.exit(1);
    }
  }
}