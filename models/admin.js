let User = require('./user');

class Admin extends User {
  constructor(admin) {
    super(admin);
  }
}

Admin.prototype.type = Admin.type = Admin.name;
module.exports = Admin;