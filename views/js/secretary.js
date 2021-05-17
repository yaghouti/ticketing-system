window.onload = function () {
  var app = new Vue({
    el: "#app",
    data: {
      activeForm: 'greeting',
      menuList: [
        {name: 'patients', text: 'بیماران'}
      ],
      profile: {},
      tests: [],
      drugs: [],
      search: '',
      recordsFor: '',
      records: [],
      showEditRecordForm: false,
      editingRecord: {
        patient: '',
        drugs: [],
        tests: []
      }
    },
    computed: {
      orderedRecords: function () {
        return this.records.sort(function (r1, r2) {
          return (r1.patient + ' ' + r1.date + r1.time) < (r1.patient + ' ' + r2.date + r2.time) ? 1 : -1;
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
      activateForm: async function (menu) {
        try {
          this.activeForm = menu.name;
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
      saveRecord: async function () {
        try {
          let submitData = {tests: [], drugs: {}};
          this.editingRecord.drugs.forEach(function (drug) {
            submitData.drugs[drug.name] = drug.value;
          });
          if (this.editingRecord.hasOwnProperty('id')) {
            submitData.tests = {};
            this.editingRecord.tests.forEach(function (test) {
              submitData.tests[test.name] = {};
              test.fields.forEach(function (field) {
                submitData.tests[test.name][field.name] = field.value;
              });
            });
            await request('PUT', `/patients/${this.editingRecord.patient}/medicalRecords/${this.editingRecord.id}`, submitData);
            for (let i = 0; i < this.records.length; i++) {
              let record = this.records[i];
              if (record.patient === this.editingRecord.patient && record.id === this.editingRecord.id) {
                record.drugs = submitData.drugs;
                record.tests = submitData.tests;
              }
            }
          }
          this.editingRecord = {patient: '', tests: [], drugs: []};
          this.showEditRecordForm = false;
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      editRecord: function (record) {
        try {
          this.editingRecord = {id: record.id, patient: record.patient, drugs: [], tests: []};
          for (let drug in record.drugs) {
            if (record.drugs.hasOwnProperty(drug)) {
              this.editingRecord.drugs.push({
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
              this.editingRecord.tests.push({
                name: test,
                fields: fields
              });
            }
          }
          this.showEditRecordForm = true;
          this.editingRecord.isEditing = true;
          window.location.href = '#editRecordForm';
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