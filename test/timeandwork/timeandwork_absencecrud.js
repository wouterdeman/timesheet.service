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
                date: new Date(2014, 1, 1),
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
    describe('when updating an existing absence', function () {
        it('should update the absence without errors', function (done) {
            AbsenceService.list().then(function (absences) {
                var absence = absences[0];
                absence.amount = 0.5;
                AbsenceService.update(absence._id, absence).then(function () {
                    done();
                });
            });
        });
        it('should return the new absence data when we list all absences', function (done) {
            AbsenceService.list().then(function (absences) {
                assert.equal(absences.length, 1);
                assert.equal(absences[0].amount, 0.5);
                done();
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
});