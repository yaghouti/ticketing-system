window.onload = function () {
  var app = new Vue({
    el: "#app",
    data: {
      activeForm: 'greeting',
      menuList: [
        {name: 'modifyTests', text: 'آزمایش‌ها'},
        {name: 'modifyDrugs', text: 'داروها'},
        {name: 'patients', text: 'بیماران'},
        {name: 'schedule', text: 'برنامه هفتگی'}
      ],
      profile: {},
      modifyingTest: {
        isEditing: false,
        name: '',
        fields: []
      },
      newDrug: {
        name: ''
      },
      tests: [],
      drugs: [],
      search: '',
      recordsFor: '',
      records: [],
      showNewRecordForm: false,
      newRecord: {
        patient: '',
        drugs: [],
        tests: []
      },
      schedule: {
        start: '',
        end: '',
        weeklySchedule: {
          sat: [],
          sun: [],
          mon: [],
          tue: [],
          wed: [],
          thu: [],
          fri: []
        }
      },
      daysOfWeek: {
        'sat': 'شنبه',
        'sun': 'یک‌شنبه',
        'mon': 'دوشنبه',
        'tue': 'سه‌شنبه',
        'wed': 'چهارشنبه',
        'thu': 'پنج‌شنبه',
        'fri': 'جمعه'
      }
    },
    computed: {
      orderedTests: function () {
        return this.tests.sort(function (t1, t2) {
          return t1.name < t2.name ? -1 : 1;
        });
      },
      orderedDrugs: function () {
        return this.drugs.sort(function (d1, d2) {
          return d1.name < d2.name ? -1 : 1;
        });
      },
      orderedRecords: function () {
        return this.records.sort(function (r1, r2) {
          return (r1.patient + r1.date + r1.time) < (r1.patient + r2.date + r2.time) ? 1 : -1;
        });
      }
    },
    methods: {
      loadProfile: async function () {
        try {
          this.profile = await request('GET', '/profile');
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      loadDrugs: async function () {
        try {
          let data = await request('GET', '/drugs');
          this.drugs = data.drugs;
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      activateForm: async function (menu) {
        try {
          this.activeForm = menu.name;
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      activateNewRecordForm: function () {
        this.showNewRecordForm = true;
        this.newRecord = {
          isEditing: false,
          patient: '',
          drugs: [],
          tests: []
        };
      },
      loadTests: async function () {
        try {
          let data = await request('GET', '/medicalTests');
          this.tests = data.medicalTests;
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      addNewField: async function () {
        this.modifyingTest.fields.push('');
      },
      saveTest: async function () {
        try {
          for (let i = 0; i < this.modifyingTest.fields.length; i++) {
            if (!this.modifyingTest.fields[i].length) {
              this.modifyingTest.fields.splice(i, 1);
              i--;
            }
          }
          if (!this.modifyingTest.name || !this.modifyingTest.fields.length) {
            alert('نام آزمایش و فیلدهای آن را تکمیل نمایید!');
            return;
          }
          if (this.modifyingTest.isEditing) {
            await request('PUT', '/medicalTests/' + this.modifyingTest.name, {fields: this.modifyingTest.fields});
          }
          else {
            let submitData = {
              name: this.modifyingTest.name,
              fields: this.modifyingTest.fields
            };
            await request('POST', '/medicalTests', submitData);
            this.tests.push(submitData);
          }
          this.modifyingTest = {isEditing: false, name: '', fields: []};
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      modifyTest: function (test) {
        this.modifyingTest = test;
        this.modifyingTest.isEditing = true;
        window.location.href = '#modifyTest';
      },
      removeTest: async function (index) {
        try {
          await request('DELETE', '/medicalTests/' + this.tests[index].name);
          this.tests.splice(index, 1);
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      removeDrug: async function (index) {
        try {
          await request('DELETE', '/drugs/' + this.drugs[index].name);
          this.drugs.splice(index, 1);
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      saveDrug: async function () {
        try {
          await request('POST', '/drugs', this.newDrug);
          this.drugs.push({...this.newDrug});
          this.newDrug.name = '';
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      fetchRecords: async function () {
        try {
          if (this.search.length) {
            let data = await request('GET', `/patients/${this.search}/medicalRecords`);
            this.records = data.medicalRecords;
            this.recordsFor = this.search;
            this.search = '';
          }
          else {
            let data = await request('GET', `/medicalRecords`);
            this.records = data.medicalRecords;
            this.recordsFor = '';
          }
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      addNewDrugToNewRecord: function () {
        if (!this.newRecord.newDrug) {
          return;
        }
        for (let i = 0; i < this.newRecord.drugs.length; i++) {
          if (this.newRecord.drugs[i].name === this.newRecord.newDrug) {
            return;
          }
        }
        this.newRecord.drugs.push({name: this.newRecord.newDrug, value: ''});
        this.newRecord.newDrug = '';
      },
      addNewTestToNewRecord: function () {
        if (!this.newRecord.newTest) {
          return;
        }
        for (let i = 0; i < this.newRecord.tests.length; i++) {
          if (this.newRecord.tests[i].name === this.newRecord.newTest) {
            return;
          }
        }
        for (let i = 0; i < this.tests.length; i++) {
          let test = this.tests[i];
          if (test.name === this.newRecord.newTest) {
            let newTest = {
              name: test.name,
              fields: []
            };
            test.fields.forEach(function (field) {
              newTest.fields.push(
                {name: field, value: ''}
              );
            });
            this.newRecord.tests.push(newTest);
            this.newRecord.newTest = '';
            return;
          }
        }
      },
      saveNewRecord: async function () {
        try {
          if (!this.newRecord.patient) {
            alert('نام کاربری بیمار را وارد نمایید!');
            return;
          }
          if (!this.newRecord.drugs.length && !this.newRecord.tests.length) {
            alert('داروها و آزمایش‌های بیمار را تکمیل نمایید!');
            return;
          }

          let submitData = {tests: [], drugs: {}};
          this.newRecord.drugs.forEach(function (drug) {
            submitData.drugs[drug.name] = drug.value;
          });
          if (this.newRecord.hasOwnProperty('id')) {
            submitData.tests = {};
            this.newRecord.tests.forEach(function (test) {
              submitData.tests[test.name] = {};
              test.fields.forEach(function (field) {
                submitData.tests[test.name][field.name] = field.value;
              });
            });
            await request('PUT', `/patients/${this.newRecord.patient}/medicalRecords/${this.newRecord.id}`, submitData);
            for (let i = 0; i < this.records.length; i++) {
              let record = this.records[i];
              if (record.patient === this.newRecord.patient && record.id === this.newRecord.id) {
                record.drugs = submitData.drugs;
                record.tests = submitData.tests;
              }
            }
          }
          else {
            this.newRecord.tests.forEach(function (test) {
              submitData.tests.push(test.name);
            });
            let data = await request('POST', `/patients/${this.newRecord.patient}/medicalRecords`, submitData);
            this.records.push(data);
          }
          this.newRecord = {patient: '', tests: [], drugs: []};
          this.showNewRecordForm = false;
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      editRecord: function (record) {
        try {
          this.newRecord = {id: record.id, patient: record.patient, drugs: [], tests: []};
          for (let drug in record.drugs) {
            if (record.drugs.hasOwnProperty(drug)) {
              this.newRecord.drugs.push({
                name: drug,
                value: record.drugs[drug]
              });
            }
          }
          for (let test in record.tests) {
            if (record.tests.hasOwnProperty(test)) {
              let fields = [];
              for (let field in record.tests[test]) {
                if (record.tests[test].hasOwnProperty(field)) {
                  fields.push({
                    name: field,
                    value: record.tests[test][field]
                  });
                }
              }
              this.newRecord.tests.push({
                name: test,
                fields: fields
              });
            }
          }
          this.showNewRecordForm = true;
          this.newRecord.isEditing = true;
          window.location.href = '#newRecordForm';
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      removeRecord: async function (index) {
        try {
          await request('DELETE', `/patients/${this.records[index].patient}/medicalRecords/${this.records[index].id}`);
          this.records.splice(index, 1);
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      removePeriod: function (day, index) {
        this.schedule.weeklySchedule[day].splice(index, 1);
      },
      addPeriod: function (day) {
        this.schedule.weeklySchedule[day].push({start: '', end: ''});
      },
      saveSchedule: async function () {
        try {
          await request('POST', '/schedules', this.schedule);
          alert('برنامه‌ی هفتگی با موفقیت ذخیره گردید.')
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      logout: async function () {
        try {
          let data = await request('GET', '/auth/logout');
          window.location.href = data.location;
        }
        catch (error) {
          alert(error.error.message);
        }
      }
    }
  });

  app.loadProfile();
  app.loadDrugs();
  app.loadTests();
};

async function request(method, url = '', data = {}) {
  // Default options are marked with *
  let options = {
    method, // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer' // no-referrer, *client
  };
  if (method !== 'GET') {
    options.body = JSON.stringify(data); // body data type must match "Content-Type" header
  }
  const response = await fetch(url, options);
  if (response.status >= 200 && response.status < 300) {
    return await response.json(); // parses JSON response into native JavaScript objects
  }
  throw await response.json();
}