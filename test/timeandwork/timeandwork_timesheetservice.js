'use strict';

var test = require('../common');
var describe = test.describe;
var it = test.it;
var before = test.before;
var assert = test.assert;
var async = test.async;
var AbsenceService = require('../../modules/timeandwork/service').AbsenceService;
var TimesheetService = require('../../modules/timeandwork/service').TimesheetService;
var HolidayService = require('../../modules/timeandwork/service').HolidayService;
var Timetracker = require('../../modules/timetracker/service');
var log = require('loggy').log;



describe('Timesheet', function () {
    log('');
    this.timeout(3600);
    test.createSandbox();
    test.mockVerifyToken();
    test.cleanupSandbox();

    describe('given a customer', function () {
        var conditions = {
            year: 2014,
            entity: test.dummyEntityId,
            month: 7, //aug
            customer: test.dummyActivityId
        };

        var nrOfWorkingDays = 21;

        var result = [];
        var summary = {};

        var getTimesheetAndDoCheckAndSetInResult = function (done) {
            TimesheetService.list(conditions).done(function (res) {
                result = res.timesheetDays;
                summary = res.summary;
                assert.equal(result.length, 31);
                done();
            });
        };
        describe('when no absences or holidays in a month are present', function () {
            test.clearDB();

            it('should give a complete timesheet', getTimesheetAndDoCheckAndSetInResult);
            it('should contain the first of the month', function (done) {
                var day = result[0];
                assert.equal(day.dayNr, 1);
                assert.equal(day.isHoliday, false);
                assert.equal(day.isTracked, false);
                assert.equal(day.isWeekend, false);
                assert.equal(day.worked, true);
                done();
            });
            it('should contain the last of the month', function (done) {
                assert.equal(result[30].dayNr, 31);
                done();
            });
            it('should indicate if a day is in the weekend', function (done) {
                assert.equal(result[1].isWeekend, true);
                assert.equal(result[1].worked, false);
                done();
            });
            it('should have correct worked days in the summary', function (done) {
                assert.equal(summary.daysWorked, nrOfWorkingDays);
                done();
            });
            it('should have correct worked hours in the summary', function (done) {
                assert.equal(summary.hoursWorked, nrOfWorkingDays * 8);
                done();
            });
            it('should have correct absence days in the summary', function (done) {
                assert.equal(summary.daysAbsence, 0);
                done();
            });
        });

        describe('when 2 absences are present', function () {
            test.clearDB();
            var dayOfAbsence1 = 8;

            before(function (done) {
                var data = [];
                data.push({
                    date: new Date(conditions.year, conditions.month, dayOfAbsence1),
                    amount: 1,
                    absenceright: test.dummyEntityId,
                    entity: test.dummyEntityId
                });
                data.push({
                    date: new Date(conditions.year, conditions.month, 11),
                    amount: 0.5,
                    absenceright: test.dummyEntityId,
                    entity: test.dummyEntityId
                });
                async.each(data, function (absence, iterateCallback) {
                    AbsenceService.save(absence).then(function () {
                        iterateCallback();
                    });
                }, function (err) {
                    if (!err) {
                        done();
                    }
                });
            });
            it('should return a timesheet', getTimesheetAndDoCheckAndSetInResult);
            it('should indicate the absence on the timesheet', function (done) {
                var timeSheetDay = result[dayOfAbsence1 - 1];
                assert.equal(timeSheetDay.worked, false);
                assert.equal(timeSheetDay.hours, 0);
                done();
            });
            it('should indicate a worked day on the timesheet', function (done) {
                var timeSheetDay = result[0];
                assert.equal(timeSheetDay.worked, true);
                assert.equal(timeSheetDay.hours, 8);
                done();
            });
            it('should indicate a half day on the timesheet', function (done) {
                var timeSheetDay = result[10];
                assert.equal(timeSheetDay.worked, true);
                assert.equal(timeSheetDay.hours, 4);
                done();
            });
            it('should have correct worked days in the summary', function (done) {
                assert.equal(summary.daysWorked, nrOfWorkingDays - 1.5);
                done();
            });
            it('should have correct worked hours in the summary', function (done) {
                assert.equal(summary.hoursWorked, nrOfWorkingDays * 8 - 8 - 4);
                done();
            });
            it('should have correct absence days in the summary', function (done) {
                assert.equal(summary.daysAbsence, 1.5);
                done();
            });
        });


        describe('when a holiday is present', function () {
            test.clearDB();
            var dayOfHoliday = 15;

            before(function (done) {
                var data = {
                    name: 'Onze iets',
                    date: new Date(conditions.year, conditions.month, dayOfHoliday)
                };
                HolidayService.save(data).then(function () {
                    done();
                });
            });
            it('should return a timesheet', getTimesheetAndDoCheckAndSetInResult);
            it('should indicate the holiday on the timesheet', function (done) {
                var timeSheetDay = result[dayOfHoliday - 1];
                assert.equal(timeSheetDay.isHoliday, true);
                done();
            });
            it('should have correct worked days in the summary', function (done) {
                assert.equal(summary.daysWorked, nrOfWorkingDays - 1);
                done();
            });
            it('should have correct worked hours in the summary', function (done) {
                assert.equal(summary.hoursWorked, nrOfWorkingDays * 8 - 8);
                done();
            });
        });


        describe('when tracked time is present', function () {
            test.clearDB();
            var trackedDay = 5;

            before(function (done) {
                //maak zone en dan een zone
                var data = {
                    entity: test.dummyEntityId,
                    loc: [51.226956, 4.401744],
                    zoneDetails: {
                        name: 'Business-IT-Engineering bvba',
                        street: 'Puttestraat',
                        number: '105',
                        city: 'Begijnendijk',
                        postalcode: '3130',
                        mobilephone: '+32 476 29 87 56'
                    },
                    activity: test.dummyActivityId,
                    activityDetails: {
                        name: 'Working for bITe'
                    }
                };
                Timetracker.saveZone(data).then(function () {
                    var data = [];
                    data.push({
                        entity: test.dummyEntityId,
                        details: {
                            type: 'BMW 316D',
                            platenumber: '1-AHQ-481',
                            area: 'Geel'
                        },
                        object: test.dummyActivityId,
                        objectdetails: {
                            devicestate: 'active',
                            devicetype: 'chrome',
                            appversion: '2.0.5'
                        },
                        loc: [51.226956, 4.401744],
                        recordedAt: new Date(conditions.year, conditions.month, trackedDay, 11)
                    });


                    async.each(data, function (crumble, iterateCallback) {
                        Timetracker.saveCrumble(crumble).then(function () {
                            iterateCallback();
                        });
                    }, function (err) {
                        if (!err) {
                            done();
                        }
                    });
                });
            });
            it('should return a timesheet', getTimesheetAndDoCheckAndSetInResult);
            it('should indicate the tracked time on the timesheet', function (done) {
                var timeSheetDay = result[trackedDay - 1];
                assert.equal(timeSheetDay.isTracked, true);
                assert.equal(timeSheetDay.trackedDuration, 300000);
                assert.ok(summary.daysTracked > 0, summary.daysTracked);
                done();
            });
        });


        describe('when tracked time for another customer is present', function () {
            test.clearDB();
            var trackedDay = 5;
            var otherCustomerId = test.dummyId3;
            before(function (done) {
                //maak zone en dan een zone
                var data = {
                    //andere klant ;)
                    entity: test.dummyEntityId,
                    loc: [51.226956, 4.401744],
                    zoneDetails: {
                        name: 'Business-IT-Engineering bvba',
                        street: 'Puttestraat',
                        number: '105',
                        city: 'Begijnendijk',
                        postalcode: '3130',
                        mobilephone: '+32 476 29 87 56'
                    },
                    activity: otherCustomerId,
                    activityDetails: {
                        name: 'Working for bITe'
                    }
                };
                Timetracker.saveZone(data).then(function () {
                    var data = [];
                    data.push({
                        entity: test.dummyEntityId,
                        details: {
                            type: 'BMW 316D',
                            platenumber: '1-AHQ-481',
                            area: 'Geel'
                        },
                        object: otherCustomerId,
                        objectdetails: {
                            devicestate: 'active',
                            devicetype: 'chrome',
                            appversion: '2.0.5'
                        },
                        loc: [51.226956, 4.401744],
                        recordedAt: new Date(conditions.year, conditions.month, trackedDay, 11)
                    });


                    async.each(data, function (crumble, iterateCallback) {
                        Timetracker.saveCrumble(crumble).then(function () {
                            iterateCallback();
                        });
                    }, function (err) {
                        if (!err) {
                            done();
                        }
                    });
                });
            });
            it('should return a timesheet', getTimesheetAndDoCheckAndSetInResult);
            it('should NOT indicate the tracked time on the timesheet', function (done) {
                var timeSheetDay = result[trackedDay - 1];
                assert.equal(timeSheetDay.isTracked, false);
                assert.equal(timeSheetDay.trackedDuration, 0);
                assert.equal(timeSheetDay.isTrackedForOtherCustomer, true);
                done();
            });

            it('should not shown worked on the day for the other customer', function (done) {
                var timeSheetDay = result[trackedDay - 1];
                assert.equal(timeSheetDay.worked, false);
                assert.equal(summary.daysWorked, nrOfWorkingDays - 1);
                assert.equal(summary.hoursWorked, nrOfWorkingDays * 8 - 8);
                assert.equal(summary.daysTracked, 0);
                done();
            });
        });
    });


});