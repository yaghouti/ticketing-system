window.onload = function () {
  var app = new Vue({
    el: "#app",
    data: {
      profile: {},
      activeForm: 'greeting',
      menuList: [{name: 'doctors', text: 'پزشکان'}, {name: 'secretaries', text: 'منشی‌ها'}, {
        name: 'specialties',
        text: 'تخصص‌ها'
      }],
      newUser: {
        doctors: [],
        specialties: []
      },
      doctors: [],
      specialties: [],
      secretaries: [],
      showModifyForm: false,
      selectedDoctor: '',
      selectedSpecialty: '',
      newSpecialty: {
        name: ''
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
      loadDoctors: async function () {
        try {
          let data = await request('GET', '/doctors');
          this.doctors = data.doctors;
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      loadSecretaries: async function () {
        try {
          let data = await request('GET', '/secretaries');
          this.secretaries = data.secretaries;
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      loadSpecialties: async function () {
        try {
          let data = await request('GET', '/specialties');
          this.specialties = data.specialties;
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      saveUser: async function () {
        // Checking for blank fields.
        if (this.newUser.username === '' || this.newUser.password === '' || this.newUser.name === '' || this.newUser.family === '') {
          alert("فیلدهای ستاره‌دار را کامل کنید!");
        }
        else {
          try {
            let submitData = {};
            if (this.newUser.name) {
              submitData.name = this.newUser.name;
            }
            if (this.newUser.family) {
              submitData.family = this.newUser.family;
            }
            if (this.newUser.password) {
              submitData.password = this.newUser.password;
            }
            if (this.activeForm === 'doctors') {
              submitData.specialties = this.newUser.specialties;
              if (this.newUser.isEditing) {
                await request('PUT', `/doctors/${this.newUser.username}`, submitData);
              }
              else {
                submitData.username = this.newUser.username;
                await request('POST', '/doctors', submitData);
                this.doctors.push(submitData);
              }
            }
            else {
              submitData.doctors = this.newUser.doctors;
              if (this.newUser.isEditing) {
                await request('PUT', `/secretaries/${this.newUser.username}`, submitData);
              }
              else {
                submitData.username = this.newUser.username;
                await request('POST', '/secretaries', submitData);
                this.secretaries.push(submitData);
              }
            }
            this.newUser = {doctors: [], specialties: []};
            this.showModifyForm = false;
            alert('کاربر با موفقیت ثبت گردید.');
          }
          catch (error) {
            alert(error.error.message);
          }
        }
      },
      editUser: function (user) {
        this.newUser = user;
        this.newUser.isEditing = true;
        this.showModifyForm = true;
        window.location.href = '#modifyForm';
      },
      removeDoctorFromSecretary: function (index) {
        this.newUser.doctors.splice(index, 1);
      },
      removeSpecialtyFromDoctor: function (index) {
        this.newUser.specialties.splice(index, 1);
      },
      removeUser: async function (index) {
        try {
          if (this.activeForm === 'doctors') {
            await request('DELETE', `/doctors/${this.doctors[index].username}`);
            this.doctors.splice(index, 1);
          }
          else {
            await request('DELETE', `/secretaries/${this.secretaries[index].username}`);
            this.secretaries.splice(index, 1);
          }
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      addDoctorToSecretary: function () {
        if (this.newUser.doctors.indexOf(this.selectedDoctor) === -1) {
          this.newUser.doctors.push(this.selectedDoctor);
        }
        this.selectedDoctor = '';
      },
      addSpecialtyToDoctor: function () {
        if (this.newUser.specialties.indexOf(this.selectedSpecialty) === -1) {
          this.newUser.specialties.push(this.selectedSpecialty);
        }
        this.selectedSpecialty = '';
      },
      saveSpecialty: async function () {
        try {
          if (!this.newSpecialty.name) {
            alert('نام تخصص را تکمیل نمایید!');
            return;
          }
          await request('POST', '/specialties', this.newSpecialty);
          this.specialties.push({...this.newSpecialty});
          this.newSpecialty = {name: ''};
          this.showModifyForm = false;
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      removeSpecialty: async function (index) {
        try {
          await request('DELETE', `/specialties/${this.specialties[index].name}`);
          this.specialties.splice(index, 1);
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
  app.loadDoctors();
  app.loadSecretaries();
  app.loadSpecialties();
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