window.onload = function () {
  var app = new Vue({
    el: "#app",
    data: {
      activeForm: 'greeting',
      menuList: [
        {name: 'getTicket', text: 'دریافت نوبت'},
        {name: 'myTickets', text: 'نوبت‌های من'},
        {name: 'myRecords', text: 'پرونده‌ی پزشکی من'}
      ],
      profile: {},
      newTicket: null,
      getTicketBy: 'specialty',
      selectedItem: null,
      myTickets: [],
      myRecords: []
    },
    computed: {
      orderedMyTickets: function () {
        return this.myTickets.sort(function (t1, t2) {
          return t1.date < t2.date ? 1 : -1;
        });
      },
      orderedMyRecords: function () {
        return this.myRecords.sort(function (r1, r2) {
          return (r1.date + r1.time) < (r2.date + r2.time) ? 1 : -1;
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
      loadDoctors: async function () {
        try {
          let data = await request('GET', '/doctors');
          this.doctors = data.doctors;
        }
        catch (error) {
          alert(error.error.message);
        }
      },
      activateForm: async function (menu) {
        try {
          this.activeForm = menu.name;
          this.newTicket = null;
          if (this.activeForm === 'myTickets') {
            this.myTickets = (await request('GET', '/tickets')).tickets;
          }
          else if (this.activeForm === 'myRecords') {
            this.myRecords = (await request('GET', '/medicalRecords')).medicalRecords;
          }
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
      getTicket: async function () {
        try {
          let submitData = {
            [this.getTicketBy]: this.selectedItem
          };
          this.newTicket = await request('POST', '/tickets', submitData);
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