window.onload = function () {
  var app = new Vue({
    el: "#app",
    data: {
      activeForm: 'login',
      menuList: [{name: 'signUp', text: 'ثبت نام'}, {name: 'login', text: 'ورود'}],
      username: '',
      password: '',
      type: 'Patient',
      newUser: {}
    },
    methods: {
      login: async function () {
        if (this.username === '' || this.password === '') {
          alert("فیلدهای ورود به سامانه را کامل کنید!");
        }
        else {
          try {
            const data = await request('POST', '/auth/login', {
              type: this.type,
              username: this.username,
              password: this.password
            });
            window.location.href = data.location;
          }
          catch (error) {
            alert(error.error.message);
          }
        }
      },
      signUp: async function () {
        let self = this;
        const file = document.querySelector('#avatar').files[0];
        if (file) {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            this.newUser.avatar = reader.result;
            doSignUp();
          };
        }
        else {
          doSignUp();
        }

        async function doSignUp() {
          // Checking for blank fields.
          if (self.newUser.username === '' || self.newUser.password === '' || self.newUser.name === '' || self.newUser.family === '') {
            alert("فیلدهای ستاره‌دار را کامل کنید!");
          }
          else {
            try {
              const data = await request('POST', '/patients', self.newUser);
              alert('ثبت نام با موفقیت انجام شد. شماره‌ی پرونده الکترونیک شما ' + data.docId + ' می‌باشد.');
              self.newUser = {};
              self.activeForm = 'login';
            }
            catch (error) {
              alert(error.error.message);
            }
          }
        }
      }
    }
  });
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