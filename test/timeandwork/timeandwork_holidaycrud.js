'use strict';

var test = require('../common');
var describe = test.describe;
var it = test.it;
var assert = test.assert;
var async = test.async;
var HolidayService = require('../../modules/timeandwork/service').HolidayService;

describe('Time and work holidays', function () {
    this.timeout(3600);
    test.createSandbox();
    test.mockVerifyToken();
    test.cleanupSandbox();
    describe('when saving a new holiday', function () {
        test.clearDB();
        it('should save the holiday without errors', function (done) {
            var data = [];
            data.push({
                name: 'Feest van de Arbeid',
                date: new Date(2014, 4, 1)
            });

            async.each(data, function (holiday, iterateCallback) {
                HolidayService.save(holiday).then(function () {
                    iterateCallback();
                });
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the new holiday when we list all holidays', function (done) {
            HolidayService.list().then(function (holidays) {
                assert.equal(holidays.length, 1);
                assert.equal(holidays[0].name, 'Feest van de Arbeid');
                done();
            });
        });
    });
    describe('when retrieving a holiday by id', function () {
        it('should retrieve the holiday', function (done) {
            HolidayService.list().then(function (holidays) {
                var holiday = holidays[0];
                HolidayService.get(holiday._id).then(function (retrievedHoliday) {
                    assert.equal(retrievedHoliday.name, 'Feest van de Arbeid');
                    done();
                });
            });
        });
    });
    describe('when updating an existing holiday', function () {
        it('should update the holiday without errors', function (done) {
            HolidayService.list().then(function (holidays) {
                var holiday = holidays[0];
                holiday.name = 'Feest van de ontwikkelaars';
                HolidayService.update(holiday._id, holiday).then(function () {
                    done();
                });
            });
        });
        it('should return the new holiday data when we list all holidays', function (done) {
            HolidayService.list().then(function (holidays) {
                assert.equal(holidays.length, 1);
                assert.equal(holidays[0].name, 'Feest van de ontwikkelaars');
                done();
            });
        });
    });
    describe('when deleting an existing holiday', function () {
        it('should update the holiday without errors', function (done) {
            HolidayService.list().then(function (holidays) {
                var holiday = holidays[0];
                HolidayService.remove(holiday._id).then(function () {
                    done();
                });
            });
        });
        it('should return the no holidays when we list all holidays', function (done) {
            HolidayService.list().then(function (holidays) {
                assert.equal(holidays.length, 0);
                done();
            });
        });
    });
});