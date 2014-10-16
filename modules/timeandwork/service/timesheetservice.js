'use strict';

var models = require('../models');
var log = require('loggy').log;


var TimeTracker = require('../../timetracker/service');
var AbsenceModel = models.absenceModel;
var HolidayModel = models.holidayModel;
var Q = require('q');
var _ = require('lodash-node');

var contractHours = 8;

var getAbsences = function (entity) {
    return AbsenceModel.find({
        entity: entity
    });
};
var getHolidays = function () {
    return HolidayModel.find();
};
var getTrackedTime = function (data) {
    return TimeTracker.getTrackedTimeAndActivity({
        entity: data.entity,
        activity: data.customer,
        from: new Date(data.year, data.month, 1),
        to: new Date(data.year, data.month + 1, 1)
    });
};
var areDaysEqual = function (day1, day2) {
    var yearsMatch = day1.getFullYear() === day2.getFullYear();
    var dateMatch = day1.getDate() === day2.getDate();
    var monthsMatch = day1.getMonth() === day2.getMonth();
    return yearsMatch && dateMatch && monthsMatch;
};
var absenceFilter = function (dayToTest, abs) {
    return areDaysEqual(abs.date, dayToTest);
};
var getTimesheetDates = function (start) {
    var end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    var step = {
        'days': 1
    };
    var days = [];
    for (var i = start; i <= end; i = i.add(step)) {
        days.push(new Date(i.getFullYear(), i.getMonth(), i.getDate()));
    }
    return days;
};
var reduceToSum = function (sum, num) {
    return sum + num;
};
var calculateForDay = function (day, absences, holidays, trackedTime, customer) {
    var hours = contractHours;
    var filterObjectWithDatePropertyForDay = _.partial(absenceFilter, day);
    var absencesForDay = _.filter(absences, filterObjectWithDatePropertyForDay);
    var isAbsence = absencesForDay.length > 0;
    _.forEach(absencesForDay, function (abs) {
        hours = hours - contractHours * abs.amount;
    });
    var isHoliday = !!_.find(holidays, filterObjectWithDatePropertyForDay);
    var isWeekend = day.isWeekend();


    //als je dag enkel voor andere klant gewerkt hebt (op basis van tracking)
    //niet meetellen
    var trackedTimeForDay = _.filter(trackedTime, filterObjectWithDatePropertyForDay);
    var trackedTimeForCustomerAndDay = _.filter(trackedTimeForDay, function (d) {
        return d.activity + '' === customer + '';
    });
    var hasTrackedTimeForOtherCustomer = trackedTimeForDay.length - trackedTimeForCustomerAndDay.length > 0;
    var isTracked = trackedTimeForCustomerAndDay.length > 0;
    var validWorkingDay = !(isHoliday || isWeekend || (hasTrackedTimeForOtherCustomer && !isTracked));
    var worked = hours > 0 && validWorkingDay;
    if (!validWorkingDay) {
        hours = 0;
    }
    var trackedDuration = _.chain(trackedTimeForCustomerAndDay)
        .pluck('duration')
        .reduce(reduceToSum)
        .value();
    return {
        dayNr: day.getDate(),
        isWeekend: isWeekend,
        isAbsence: isAbsence,
        isHoliday: isHoliday,
        worked: worked,
        hours: hours,
        isTracked: isTracked,
        isTrackedForOtherCustomer: hasTrackedTimeForOtherCustomer,
        trackedDuration: trackedDuration || 0
    };
};
var calculate = function (start, absences, holidays, trackedTime, conditions) {
    var res = _.map(getTimesheetDates(start), function (i) {
        return calculateForDay(i, absences, holidays, trackedTime, conditions.customer);
    });
    //log(res);
    return res;
};


var makeSummary = function (timesheetDays) {
    var daysAbsenceCondition = {
        isAbsence: true
    };
    var daysWorkedCondition = {
        worked: true
    };
    var trackedConditon = {
        isTracked: true
    };

    var workedDays = _.filter(timesheetDays, daysWorkedCondition);
    var hoursWorked = _.chain(workedDays).pluck('hours').reduce(reduceToSum).value();
    var daysWorked = _.reduce(workedDays, function (sum, day) {
        return sum + day.hours / contractHours;
    }, 0);


    var daysTracked = _.chain(timesheetDays)
        .filter(trackedConditon)
        .reduce(function (sum, day) {
            var durationInHours = day.trackedDuration / (1000 * 60 * 60);
            return sum + durationInHours / contractHours;
        }, 0)
        .value();

    var daysAbsence = _.chain(timesheetDays)
        .filter(daysAbsenceCondition)
        .reduce(function (sum, day) {
            return sum + (contractHours - day.hours) / contractHours;
        }, 0)
        .value();

    var res = {
        hoursWorked: hoursWorked,
        daysWorked: daysWorked,
        daysAbsence: daysAbsence,
        daysTracked: (daysTracked).toFixed(2)
    };
    return res;
};

var validateConditons = function (conditions) {
    if (!conditions) {
        throw new Error('Need HTTP parameters for timesheet info');
    }
    if (!conditions.customer) {
        throw new Error('No customer defined');
    }
    if (!conditions.entity) {
        throw new Error('No entity defined');
    }
    if (!conditions.year) {
        throw new Error('No year defined');
    }
    if (!conditions.month) {
        throw new Error('No month defined');
    }
    log(conditions);
};

exports.list = function (conditions) {
    validateConditons(conditions);
    var deferred = Q.defer();
    Q.all([getAbsences(conditions.entity), getHolidays(), getTrackedTime(conditions)])
        .spread(function (absences, holidays, trackedTime) {
            var start = new Date(conditions.year, conditions.month, 1);
            var timesheetDays = calculate(start, absences, holidays, trackedTime, conditions);
            var summary = makeSummary(timesheetDays);
            var res = {
                timesheetDays: timesheetDays,
                summary: summary
            };
            deferred.resolve(res);
        }).done();
    return deferred.promise;
};