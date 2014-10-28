'use strict';

var test = require('../common');
var describe = test.describe;
var it = test.it;
var assert = test.assert;
var async = test.async;
var AbsenceService = require('../../modules/timeandwork/service').AbsenceService;

describe('Time and work absences', function () {
    this.timeout(3600);
    test.createSandbox();
    test.mockVerifyToken();
    test.cleanupSandbox();
    describe('when saving a new absence', function () {
        test.clearDB();
        it('should save the absence without errors', function (done) {
            var data = [];
            data.push({
                from: new Date(2014, 8, 8),
                to: new Date(2014, 8, 8),
                amount: 1,
                prenoon: false,
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
        it('should return the new absence when we list all absences', function (done) {
            AbsenceService.list().then(function (absences) {
                assert.equal(absences.length, 1);
                assert.equal(absences[0].amount, 1);
                done();
            });
        });
    });
    describe('when retrieving an absence by id', function () {
        it('should retrieve the absence', function (done) {
            AbsenceService.list().then(function (absences) {
                var absence = absences[0];
                AbsenceService.get(absence._id).then(function (retrievedAbsence) {
                    assert.equal(retrievedAbsence.amount, 1);
                    done();
                });
            });
        });
    });
    describe('when deleting an existing absence', function () {
        it('should update the absence without errors', function (done) {
            AbsenceService.list().then(function (absences) {
                var absence = absences[0];
                AbsenceService.remove(absence._id).then(function () {
                    done();
                });
            });
        });
        it('should return the no absence when we list all absences', function (done) {
            AbsenceService.list().then(function (absences) {
                assert.equal(absences.length, 0);
                done();
            });
        });
    });
    describe('when saving a week of absence', function () {
        test.clearDB();
        it('should save the absence without errors', function (done) {
            var data = [];
            data.push({
                from: new Date(2014, 0, 1),
                to: new Date(2014, 0, 7),
                amount: 1,
                prenoon: false,
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
        it('should return 5 absences because we skip weekends', function (done) {
            AbsenceService.list().then(function (absences) {
                assert.equal(absences.length, 5);
                assert.equal(absences[0].amount, 1);
                done();
            });
        });
    });
    describe('when an invalid absence from and to date', function () {
        test.clearDB();
        it('should not save the invalid absence', function (done) {
            var data = [];
            data.push({
                from: new Date(2014, 0, 7),
                to: new Date(2014, 0, 1),
                amount: 1,
                prenoon: false,
                absenceright: test.dummyEntityId,
                entity: test.dummyEntityId
            });

            async.each(data, function (absence, iterateCallback) {
                AbsenceService.save(absence).then(function () {
                    iterateCallback();
                }, function (err) {
                    assert.equal(err, 'The from date should fall before the to date!');
                    done();
                });
            }, function (err) {
                if (err) {
                    done();
                }
            });
        });
    });
});
