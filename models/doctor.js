let moment = require('jalali-moment');
let config = require('../configs')();
let locker = require('../configs/locker');
let User = require('./user');
let Secretary = require('./secretary');
let mongodb = require('../configs/mongodb');
const errors = require("../configs/errors");
let daysOfWeek = {
  'شنبه': 'sat',
  'یک‌شنبه': 'sun',
  'دوشنبه': 'mon',
  'سه‌شنبه': 'tue',
  'چهارشنبه': 'wed',
  'پنج‌شنبه': 'thu',
  'جمعه': 'fri'
};
const VISIT_DURATION = 20;
moment.locale('fa');

class Doctor extends User {
  constructor(doctor) {
    super(doctor);
  }

  set specialties(specialties) {
    this.fields.specialties = specialties;
  }

  get specialties() {
    return this.fields.specialties;
  }

  async remove() {
    await super.remove.call(this);
  }

  static async removeDoctors(usernames) {
    await super.removeUsers(usernames);
  }

  async saveSchedule(start, end, weeklySchedule) {
    let self = this;
    let lock;
    try {
      let resource = 'locks:ticketGenerator';
      let lockerMan = await locker.getLocker();
      lock = await lockerMan.lock(resource, config.locker.ttl);
      let lastAssignedTicket = await getLastAssignedTicket();
      moveStartToTheDayAfterLastAssignedTicket(lastAssignedTicket);
      updateAttendanceTimes();
      await self.save();
      let tickets = generateTickets();
      await removeTicketsBetween(start, end);
      await addTicketsToDb(tickets);
    }
    catch (e) {
      handleError(errors.saveScheduleError, {username: self.username, e});
    }
    finally {
      lock && lock.unlock()
        .catch(function (error) {
          log(errors.unlockError, {error});
        });
    }

    async function getLastAssignedTicket() {
      let dbObj = await mongodb.getDbObject();
      let query = {$and: [{'doctor.username': self.username}, {"patient": {$ne: null}}]};
      let projection = {_id: 0, date: 1};
      let sort = {date: 1};
      return await dbObj.collection('tickets').find(query).project(projection).sort(sort).limit(1).toArray()[0];
    }

    function moveStartToTheDayAfterLastAssignedTicket(lastAssignedTicket) {
      if (lastAssignedTicket) {
        let startDay = moment(start);
        let today = moment();
        let lastOccupiedDate = moment(lastAssignedTicket.date);
        if (startDay.isSameOrBefore(lastOccupiedDate)) {
          startDay = lastOccupiedDate.add(1, 'd');
        }
        if (startDay.isBefore(today)) {
          startDay = today;
        }
        start = startDay.format('YYYY/MM/DD');
      }
    }

    async function updateAttendanceTimes() {
      let newPeriod = {start, end, weeklySchedule};
      if (!self.fields.hasOwnProperty('attendanceTimes')) {
        self.fields.attendanceTimes = [];
      }
      insertNewPeriodInAttendanceTimes(newPeriod, self.fields.attendanceTimes);
    }

    function insertNewPeriodInAttendanceTimes(newPeriod, attendanceTimes) {
      newPeriod.start = moment(newPeriod.start, 'YYYY/MM/DD').format('YYYY/MM/DD');
      newPeriod.end = moment(newPeriod.end, 'YYYY/MM/DD').format('YYYY/MM/DD');
      let newPeriodStart = moment(newPeriod.start, 'YYYY/MM/DD');
      let newPeriodEnd = moment(newPeriod.end, 'YYYY/MM/DD');
      let indexOfNewPeriod = attendanceTimes.length;
      for (let i = 0; i < attendanceTimes.length; i++) {
        let period = attendanceTimes[i];
        let periodStart = moment(period.start, 'YYYY/MM/DD');
        let periodEnd = moment(period.end, 'YYYY/MM/DD');
        if (periodStart.isBetween(newPeriodStart, newPeriodEnd) && periodEnd.isAfter(newPeriodEnd)) {
          // shrink period left to right
          period.start = newPeriodEnd.add(1, 'day').format('YYYY/MM/DD');
          newPeriodEnd.subtract(1, 'day');
          indexOfNewPeriod = i;
        }
        else if (periodStart.isBefore(newPeriodStart) && periodEnd.isBetween(newPeriodStart, newPeriodEnd)) {
          // shrink period right to left
          period.end = newPeriodStart.subtract(1, 'day').format('YYYY/MM/DD');
          newPeriodStart.add(1, 'day');
          indexOfNewPeriod = i + 1;
        }
        else if (periodStart.isBefore(newPeriodStart) && periodEnd.isAfter(newPeriodEnd)) {
          // split period
          let periodAfterNewPeriod = {...period};
          periodAfterNewPeriod.start = newPeriodEnd.add(1, 'day').format('YYYY/MM/DD');
          newPeriodEnd.subtract(1, 'day');
          attendanceTimes.splice(i + 1, 0, periodAfterNewPeriod);
          period.end = newPeriodStart.subtract(1, 'day').format('YYYY/MM/DD');
          newPeriodStart.add(1, 'day');
          indexOfNewPeriod = i + 1;
        }
        else if (periodStart.isSameOrAfter(newPeriodStart) && periodEnd.isSameOrBefore(newPeriodEnd)) {
          // remove period
          attendanceTimes.splice(i, 1);
          indexOfNewPeriod = i;
          i--;
        }
      }

      // insert new attendance time in the sorted attendanceTimes list
      attendanceTimes.splice(indexOfNewPeriod, 0, newPeriod);
    }

    function generateTickets() {
      let tickets = [];
      let inProcessDay = moment(start, 'YYYY/MM/DD');
      let lastDay = moment(end, 'YYYY/MM/DD');
      while (inProcessDay.isSameOrBefore(lastDay)) {
        let dayOfWeek = daysOfWeek[inProcessDay.format('ddd')];
        weeklySchedule[dayOfWeek].forEach(period=> {
          let inProcessTime = moment(inProcessDay.format('YYYY/MM/DD') + ' ' + period.start, 'YYYY/MM/DD HH:mm');
          let lastTime = moment(inProcessDay.format('YYYY/MM/DD') + ' ' + period.end, 'YYYY/MM/DD HH:mm');
          lastTime.subtract(VISIT_DURATION, 'm');
          while (inProcessTime.isSameOrBefore(lastTime)) {
            tickets.push({
              date: inProcessTime.format('YYYY/MM/DD'),
              time: inProcessTime.format('HH:mm'),
              dayOfWeek: inProcessDay.format('ddd'),
              doctor: {username: self.username, fullName: `${self.name} ${self.family}`},
              specialties: self.specialties,
              patient: null
            });
            inProcessTime.add(VISIT_DURATION, 'm');
          }
        });

        inProcessDay.add(1, 'day');
      }
      return tickets;
    }

    async function removeTicketsBetween(start, end) {
      start = moment(start, 'YYYY/MM/DD').format('YYYY/MM/DD');
      end = moment(end, 'YYYY/MM/DD').format('YYYY/MM/DD');
      let dbObj = await mongodb.getDbObject();
      let query = {$and: [{'doctor.username': self.username}, {date: {$gte: start}}, {date: {$lte: end}}]};
      await dbObj.collection('tickets').deleteMany(query);
    }

    async function addTicketsToDb(tickets) {
      if (tickets.length) {
        let dbObj = await mongodb.getDbObject();
        return await dbObj.collection('tickets').insertMany(tickets);
      }
    }
  }

  getSchedule(start, end) {
    let self = this;
    start = moment(start, 'YYYY/MM/DD');
    end = moment(end, 'YYYY/MM/DD');

    let schedule = [];
    self.fields.attendanceTimes.forEach(function (attendanceTime) {
      let inProcessDay = moment(attendanceTime.start, 'YYYY/MM/DD');
      let lastDay = moment(attendanceTime.end, 'YYYY/MM/DD');
      while (inProcessDay.isSameOrBefore(lastDay)) {
        if (inProcessDay.isSameOrAfter(start) && inProcessDay.isSameOrBefore(end)) {
          let persianDayOfWeek = inProcessDay.format('ddd');
          let dayOfWeek = daysOfWeek[persianDayOfWeek];
          schedule.push({
            date: inProcessDay.format('YYYY/MM/DD'),
            dayOfWeek: persianDayOfWeek,
            attendanceTimes: attendanceTime.weeklySchedule[dayOfWeek]
          });
        }
        inProcessDay.add(1, 'day');
      }
    });

    return schedule;
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

Doctor.prototype.type = Doctor.type = Doctor.name;
module.exports = Doctor;