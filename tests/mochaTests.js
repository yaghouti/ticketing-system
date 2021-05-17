let assert = require('chai').assert;
let request = require('request');
let serverUrl = 'http://localhost:3000';
let samples = {
    login: {
        doctor: {
            "type": "Doctor",
            "username": "dr1",
            "password": "123"
        },
        patient: {
            "type": "Patient",
            "username": "majid1",
            "password": "123"
        }
    },
    create: {
        secretery: {
            "username": "sec120",
            "password": "123",
            "name": "sec120",
            "family": "yaghouti"
        },
        specialty: {
            "name": "sp120"
        },
        patient: {
            "username": "majid120",
            "password": "123",
            "name": "majid",
            "family": "yaghouti",
            "phone": "09151598034",
            "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAFCSURBVDjLpdM9S1xREAbgZy/X4CaE+LFgEklnWLSxtJGAfyCgbCOIRfqkyz+wSClEC0ELOyGF1WJjlcJSCfYiRtJF1PhFPrwWd0IOukbFac7MHM4778w7p1IUhftYpahW5/ASFWQocIAVLOBXi3cTeIPdHMMYwG8cow0P8RrtmG4B0IcRfM1wEsk1NPAO3yL3Ho9aAPyM8zgP6rCD1fCfYgo1dAezliPIkiD1T5NKJ/5jeeI/QT2qTkauie+3BXiFZfSgCxt4G6pcayntc5zhKOJ2vHCDpQCflSqM4gv68eEuAD+whXX/1KijEzP4hKGE7RWAtsQ/jPOBcqnGgt3zy7PLkyGlw/qT3J9iD8+ivbMAg/1MKR88TgD+Lk4tWpiPeBxLGIx4OsdH9GIzAWgq5cyUmzgbbTXQgW0sYrVy3+98AemDQ4qngPQBAAAAAElFTkSuQmCC"
        }
    }
};

function login(data, expectedResult) {
    return function (done) {
        request.post(
            {
                url: serverUrl + '/auth/login',
                json: data,
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, expectedResult);
                    done();
                }
            }
        );
    }
}

function readAll(path, name) {
    return function (done) {
        request.get(
            {
                url: serverUrl + path,
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.property(body, name);
                    assert.typeOf(body[name], 'array');
                    done();
                }
            }
        );
    }
}

function create(path, data) {
    return function (done) {
        request.post(
            {
                url: serverUrl + path,
                json: data
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, {status: 'Success'});
                    done();
                }
            }
        );
    }
}

function deleteOne(path) {
    return function (done) {
        request.delete(
            {
                url: serverUrl + path
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.deepEqual(body, {status: 'Success'});
                    done();
                }
            }
        );
    }
}

function deleteMany(path, data) {
    return function (done) {
        request.delete(
            {
                url: serverUrl + path,
                json: data
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, {status: 'Success'});
                    done();
                }
            }
        );
    }
}

describe('Authentication', () => {
    it('Should login a doctor', login(samples.login.doctor, {location: 'doctor.html'}));
    it('Should login a patient', login(samples.login.patient, {location: 'patient.html'}));
    it('Should logout', (done) => {
        request.get({url: serverUrl + '/auth/logout'}, function (err, httpResponse, body) {
            if (err) {
                done(new Error(err));
            }
            else {
                body = JSON.parse(body);
                assert.deepEqual(body, {location: '/'});
                done();
            }
        });
    });
});
describe('Doctors', () => {
    it('Should create a doctor', (done) => {
        request.post(
            {
                url: serverUrl + '/doctors',
                json: {
                    "username": "dr3",
                    "password": "123",
                    "name": "majid",
                    "family": "yaghouti",
                    "specialties": ["sp1", "sp2"]
                }
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, {status: 'Success'});
                    done();
                }
            }
        );
    });
    it('Should update a doctor', (done) => {
        request.put(
            {
                url: serverUrl + '/doctors/dr3',
                json: {
                    "name": "majid2",
                    "family": "yaghouti2",
                    "password": "123",
                    "specialties": ["sp1"]
                }
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, {
                        "name": "majid2",
                        "family": "yaghouti2",
                        "specialties": ["sp1"]
                    });
                    done();
                }
            }
        );
    });
    it('Should read a doctor', (done) => {
        request.get(
            {
                url: serverUrl + '/doctors/dr1'
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.hasAllKeys(body, [
                        'username',
                        'password',
                        'name',
                        'family',
                        'specialties',
                        'attendanceTimes'
                    ]);
                    assert.typeOf(body.username, 'string');
                    assert.typeOf(body.password, 'string');
                    assert.typeOf(body.name, 'string');
                    assert.typeOf(body.family, 'string');
                    assert.typeOf(body.specialties, 'array');
                    assert.typeOf(body.attendanceTimes, 'array');
                    done();
                }
            }
        );
    });
    it('Should delete a doctor (dr3)', deleteOne('/doctors/dr3'));
    it('Should delete some doctors (dr4 & dr5)', deleteMany('/doctors', ['dr4', 'dr5']));
    it('Should read all doctors', readAll('/doctors', 'doctors'));
});
describe('Drugs', () => {
    it('Should create a drug', (done) => {
        request.post(
            {
                url: serverUrl + '/drugs',
                json: {
                    "name": "drug3"
                }
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, {status: 'Success'});
                    done();
                }
            }
        );
    });
    it('Should delete a drug (drug3)', deleteOne('/drugs/drug3'));
    it('Should delete some drugs (drug3 & drug4)', deleteMany('/drugs', ["drug3", "drug4"]));
    it('Should read all drugs', (done) => {
        request.get(
            {
                url: serverUrl + '/drugs'
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.property(body, 'drugs');
                    assert.typeOf(body.drugs, 'array');
                    done();
                }
            }
        );
    });
});
describe('Medical Records', () => {
    before('Login as a Patient', login(samples.login.patient, {location: 'patient.html'}));
    it('Should get medical records of logged in user', (done) => {
        request.get(
            {
                url: serverUrl + '/medicalRecords',
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.property(body, 'medicalRecords');
                    assert.typeOf(body.medicalRecords, 'array');
                    done();
                }
            }
        );
    });
});
describe('Medical Tests', () => {
    it('Should create a medical test', (done) => {
        request.post(
            {
                url: serverUrl + '/medicalTests',
                json: {
                    "name": "mt4",
                    "fields": ["f1", "f2", "f4"]
                }
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, {status: 'Success'});
                    done();
                }
            }
        );
    });
    it('Should update a medical test', (done) => {
        request.put(
            {
                url: serverUrl + '/medicalTests/mt4',
                json: {
                    "fields": [
                        "f1",
                        "f2",
                        "f6"
                    ]
                }
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, {
                        "fields": [
                            "f1",
                            "f2",
                            "f6"
                        ]
                    });
                    done();
                }
            }
        );
    });
    it('Should read a medical test', (done) => {
        request.get(
            {
                url: serverUrl + '/medicalTests/mt4'
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.deepEqual(body, {
                        "name": "mt4",
                        "fields": [
                            "f1",
                            "f2",
                            "f6"
                        ]
                    });
                    done();
                }
            }
        );
    });
    it('Should delete a medical test (mt4)', deleteOne('/medicalTests/mt4'));
    it('Should delete some medical tests (mt4 & mt5)', deleteMany('/medicalTests', ['mt4', 'mt5']));
    it('Should read all medical tests', readAll('/medicalTests', 'medicalTests'));
});
describe('Patients', () => {
    let patientDocumentId;
    before('Delete sample patient', (done)=>{
        request.delete(
            {
                url: serverUrl + '/patients/majid120'
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    done();
                }
            }
        );
    });
    it('Should create a patient', (done) => {
        request.post(
            {
                url: serverUrl + '/patients',
                json: {
                    "username": "majid120",
                    "password": "123",
                    "name": "majid",
                    "family": "yaghouti",
                    "phone": "09151598034",
                    "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAFCSURBVDjLpdM9S1xREAbgZy/X4CaE+LFgEklnWLSxtJGAfyCgbCOIRfqkyz+wSClEC0ELOyGF1WJjlcJSCfYiRtJF1PhFPrwWd0IOukbFac7MHM4778w7p1IUhftYpahW5/ASFWQocIAVLOBXi3cTeIPdHMMYwG8cow0P8RrtmG4B0IcRfM1wEsk1NPAO3yL3Ho9aAPyM8zgP6rCD1fCfYgo1dAezliPIkiD1T5NKJ/5jeeI/QT2qTkauie+3BXiFZfSgCxt4G6pcayntc5zhKOJ2vHCDpQCflSqM4gv68eEuAD+whXX/1KijEzP4hKGE7RWAtsQ/jPOBcqnGgt3zy7PLkyGlw/qT3J9iD8+ivbMAg/1MKR88TgD+Lk4tWpiPeBxLGIx4OsdH9GIzAWgq5cyUmzgbbTXQgW0sYrVy3+98AemDQ4qngPQBAAAAAElFTkSuQmCC"
                }
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.property(body, 'docId');
                    assert.typeOf(body.docId, 'number');
                    patientDocumentId = body.docId;
                    done();
                }
            }
        );
    });
    it('Should update a patient', (done) => {
        request.put(
            {
                url: serverUrl + '/patients/majid120',
                json: {
                    "name": "majidUPDATED",
                    "family": "yaghoutiUPDATED"
                }
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, {
                        "name": "majidUPDATED",
                        "family": "yaghoutiUPDATED"
                    });
                    done();
                }
            }
        );
    });
    it('Should read a patient (majid120)', (done) => {
        request.get(
            {
                url: serverUrl + '/patients/majid120'
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.deepEqual(body, {
                        "username": "majid120",
                        "docId": patientDocumentId,
                        "name": "majidUPDATED",
                        "family": "yaghoutiUPDATED",
                        "phone": "09151598034",
                        "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAFCSURBVDjLpdM9S1xREAbgZy/X4CaE+LFgEklnWLSxtJGAfyCgbCOIRfqkyz+wSClEC0ELOyGF1WJjlcJSCfYiRtJF1PhFPrwWd0IOukbFac7MHM4778w7p1IUhftYpahW5/ASFWQocIAVLOBXi3cTeIPdHMMYwG8cow0P8RrtmG4B0IcRfM1wEsk1NPAO3yL3Ho9aAPyM8zgP6rCD1fCfYgo1dAezliPIkiD1T5NKJ/5jeeI/QT2qTkauie+3BXiFZfSgCxt4G6pcayntc5zhKOJ2vHCDpQCflSqM4gv68eEuAD+whXX/1KijEzP4hKGE7RWAtsQ/jPOBcqnGgt3zy7PLkyGlw/qT3J9iD8+ivbMAg/1MKR88TgD+Lk4tWpiPeBxLGIx4OsdH9GIzAWgq5cyUmzgbbTXQgW0sYrVy3+98AemDQ4qngPQBAAAAAElFTkSuQmCC"
                    });
                    done();
                }
            }
        );
    });
    it('Should delete a patient (majid120)', deleteOne('/patients/majid120'));
    it('Should delete some patients (majid120 & majid121)', deleteMany('/patients', ['majid120', 'majid121']));
    it('Should read all patients', readAll('/patients', 'patients'));
});
describe('Operations related to Patients', function () {
    var medicalRecordId;
    before('Login as a Doctor', login(samples.login.doctor, {location: 'doctor.html'}));
    before('Create a patient (majid120)', (done) => {
        request.post(
            {
                url: serverUrl + '/patients',
                json: {
            "username": "majid120",
                "password": "123",
                "name": "majid",
                "family": "yaghouti",
                "phone": "09151598034",
                "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAFCSURBVDjLpdM9S1xREAbgZy/X4CaE+LFgEklnWLSxtJGAfyCgbCOIRfqkyz+wSClEC0ELOyGF1WJjlcJSCfYiRtJF1PhFPrwWd0IOukbFac7MHM4778w7p1IUhftYpahW5/ASFWQocIAVLOBXi3cTeIPdHMMYwG8cow0P8RrtmG4B0IcRfM1wEsk1NPAO3yL3Ho9aAPyM8zgP6rCD1fCfYgo1dAezliPIkiD1T5NKJ/5jeeI/QT2qTkauie+3BXiFZfSgCxt4G6pcayntc5zhKOJ2vHCDpQCflSqM4gv68eEuAD+whXX/1KijEzP4hKGE7RWAtsQ/jPOBcqnGgt3zy7PLkyGlw/qT3J9iD8+ivbMAg/1MKR88TgD+Lk4tWpiPeBxLGIx4OsdH9GIzAWgq5cyUmzgbbTXQgW0sYrVy3+98AemDQ4qngPQBAAAAAElFTkSuQmCC"
        },
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    done();
                }
            }
        );
    });
    it('Should create a medical record for a patient (majid120)', (done) => {
        request.post(
            {
                url: serverUrl + '/patients/majid120/medicalRecords',
                json: {
                    "tests": ["mt1"],
                    "drugs": {
                        "drug1": "",
                        "drug3": "2"
                    }
                },
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    medicalRecordId = body.id;
                    assert.deepEqual(body, {
                        "id": body.id,
                        "patient": "majid120",
                        "doctor": "dr1",
                        "tests": {
                            "mt1": {
                                "f1": null,
                                "f2": null,
                                "f3": null
                            }
                        },
                        "drugs": {
                            "drug1": null
                        },
                        "date": body.date,
                        "time": body.time
                    });
                    done();
                }
            }
        );
    });
    it('Should update medical record of a patient (majid120)', (done) => {
        request.put(
            {
                url: serverUrl + '/patients/majid120/medicalRecords/' + medicalRecordId,
                json: {
                    "tests": {
                        "mt1": {
                            "f1": "1",
                            "f2": "2",
                            "f3": "3"
                        }
                    },
                    "drugs": {
                        "drug1": "1",
                        "drug3": "3"
                    }
                },
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, {
                        "id": medicalRecordId,
                        "patient": "majid120",
                        "doctor": "dr1",
                        "tests": {
                            "mt1": {
                                "f1": "1",
                                "f2": "2",
                                "f3": "3"
                            }
                        },
                        "drugs": {
                            "drug1": "1"
                        },
                        "date": body.date,
                        "time": body.time
                    });
                    done();
                }
            }
        );
    });
    it('Should read a medical record of a patient (majid120)', (done) => {
        request.get(
            {
                url: serverUrl + '/patients/majid120/medicalRecords/' + medicalRecordId,
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.deepEqual(body, {
                        "id": medicalRecordId,
                        "patient": "majid120",
                        "doctor": "dr1",
                        "tests": {
                            "mt1": {
                                "f1": "1",
                                "f2": "2",
                                "f3": "3"
                            }
                        },
                        "drugs": {
                            "drug1": "1"
                        },
                        "date": body.date,
                        "time": body.time
                    });
                    done();
                }
            }
        );
    });
    it('Should delete medical record of a patient (majid120)', function(done){
        deleteOne('/patients/majid120/medicalRecords/' + medicalRecordId)(done);
    });
    it('Should read all medical records of a patient (majid120)', readAll('/patients/majid120/medicalRecords', 'medicalRecords'));
});
describe('Profile', () => {
    before('Login as a Patient', (done) => {
        request.post(
            {
                url: serverUrl + '/auth/login',
                json: {
                    "type": "Patient",
                    "username": "majid1",
                    "password": "123"
                },
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    cookies = httpResponse.headers['set-cookie'];
                    assert.deepEqual(body, {location: 'patient.html'});
                    done();
                }
            }
        );
    });
    it('Should get profile of logged in user', (done) => {
        request.get(
            {
                url: serverUrl + '/profile',
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.deepEqual(body, {
                        "username": "majid1",
                        "docId": 1034,
                        "name": "majid1",
                        "family": "yaghouti1",
                        "phone": "09151598034",
                        "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAACxMAAAsTAQCanBgAAAFCSURBVDjLpdM9S1xREAbgZy/X4CaE+LFgEklnWLSxtJGAfyCgbCOIRfqkyz+wSClEC0ELOyGF1WJjlcJSCfYiRtJF1PhFPrwWd0IOukbFac7MHM4778w7p1IUhftYpahW5/ASFWQocIAVLOBXi3cTeIPdHMMYwG8cow0P8RrtmG4B0IcRfM1wEsk1NPAO3yL3Ho9aAPyM8zgP6rCD1fCfYgo1dAezliPIkiD1T5NKJ/5jeeI/QT2qTkauie+3BXiFZfSgCxt4G6pcayntc5zhKOJ2vHCDpQCflSqM4gv68eEuAD+whXX/1KijEzP4hKGE7RWAtsQ/jPOBcqnGgt3zy7PLkyGlw/qT3J9iD8+ivbMAg/1MKR88TgD+Lk4tWpiPeBxLGIx4OsdH9GIzAWgq5cyUmzgbbTXQgW0sYrVy3+98AemDQ4qngPQBAAAAAElFTkSuQmCC"
                    });
                    done();
                }
            }
        );
    });
});
describe('Schedules', () => {
    before('Login as a Doctor', login(samples.login.doctor, {location: 'doctor.html'}));
    it('Should create a schedule', (done) => {
        request.post(
            {
                url: serverUrl + '/schedules',
                json: {
                    "start": "1398/6/31",
                    "end": "1398/08/5",
                    "weeklySchedule": {
                        "sat": [
                            {
                                "start": "9:0",
                                "end": "10:4"
                            },
                            {
                                "start": "21:30",
                                "end": "23:59"
                            }
                        ],
                        "sun": [
                            {
                                "start": "10:0",
                                "end": "11:4"
                            }
                        ],
                        "mon": [
                            {
                                "start": "00:10",
                                "end": "3:59"
                            }
                        ],
                        "tue": [
                            {
                                "start": "10:0",
                                "end": "11:4"
                            }
                        ],
                        "wed": [
                            {
                                "start": "10:0",
                                "end": "11:4"
                            }
                        ],
                        "thu": [
                            {
                                "start": "10:0",
                                "end": "11:4"
                            }
                        ],
                        "fri": []
                    }
                },
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, {status: 'Success'});
                    done();
                }
            }
        );
    });
    it('Should read a schedule', (done) => {
        request.get(
            {
                url: serverUrl + '/schedules/13980701/13980706',
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.property(body, 'schedule');
                    assert.typeOf(body.schedule, 'array');
                    done();
                }
            }
        );
    });
});
describe('Secretaries', () => {
    it('Should create a secretary (sec120)', create('/secretaries', samples.create.secretery));
    it('Should update a secretary (sec120)', (done) => {
        request.put(
            {
                url: serverUrl + '/secretaries/sec120',
                json: {
                    "name": "sec120-UPDATED",
                    "family": "yaghouti-UPDATED",
                    "password": "123"
                }
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.deepEqual(body, {
                        "name": "sec120-UPDATED",
                        "family": "yaghouti-UPDATED"
                    });
                    done();
                }
            }
        );
    });
    it('Should read a secretary (sec120)', (done) => {
        request.get(
            {
                url: serverUrl + '/secretaries/sec120'
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.deepEqual(body, {
                        "username": "sec120",
                        "name": "sec120-UPDATED",
                        "family": "yaghouti-UPDATED",
                        "doctors": []
                    });
                    done();
                }
            }
        );
    });
    it('Should delete a secretary (sec120)', deleteOne('/secretaries/sec120'));
    it('Should delete some secretary (sec120 & sec121)', deleteMany('/secretaries',['sec120', 'sec121']));
    it('Should read all secretaries', readAll('/secretaries', 'secretaries'));
});
describe('Specialties', () => {
    it('Should create a specialty (sp120)', create('/specialties', samples.create.specialty));
    it('Should delete a specialty (sp120)', deleteOne('/specialties/sp120'));
    it('Should delete some specialties (sp120 & sp121)', deleteMany('/specialties', ['sp120', 'sp121']));
    it('Should read all specialties', readAll('/specialties', 'specialties'));
});
describe('Tickets', () => {
    before('Login as a Patient', login(samples.login.patient, {location: 'patient.html'}));
    it('Should get tickets of logged in patient', (done) => {
        request.get(
            {
                url: serverUrl + '/tickets',
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    body = JSON.parse(body);
                    assert.property(body, 'tickets');
                    assert.typeOf(body.tickets, 'array');
                    done();
                }
            }
        );
    });
    it('Should assign a ticket by doctor', (done) => {
        request.post(
            {
                url: serverUrl + '/tickets',
                json: {
                    "doctor": "dr1"
                },
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.hasAllKeys(body, ['date', 'time', 'dayOfWeek', 'doctor', 'specialties']);
                    assert.typeOf(body.date, 'string');
                    assert.typeOf(body.time, 'string');
                    assert.typeOf(body.dayOfWeek, 'string');
                    assert.typeOf(body.doctor, 'object');
                    assert.typeOf(body.specialties, 'array');
                    done();
                }
            }
        );
    });
    it('Should assign a ticket by specialty', (done) => {
        request.post(
            {
                url: serverUrl + '/tickets',
                json: {
                    "specialty": "sp1"
                },
                jar: true
            },
            function (err, httpResponse, body) {
                if (err) {
                    done(new Error(err));
                }
                else {
                    assert.hasAllKeys(body, ['date', 'time', 'dayOfWeek', 'doctor', 'specialties']);
                    assert.typeOf(body.date, 'string');
                    assert.typeOf(body.time, 'string');
                    assert.typeOf(body.dayOfWeek, 'string');
                    assert.typeOf(body.doctor, 'object');
                    assert.typeOf(body.specialties, 'array');
                    done();
                }
            }
        );
    });
});
