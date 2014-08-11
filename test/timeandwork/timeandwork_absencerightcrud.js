'use strict';

var test = require('../common');
var describe = test.describe;
var it = test.it;
var assert = test.assert;
var async = test.async;
var AbsenceRightService = require('../../modules/timeandwork/service').AbsenceRightService;

describe('Time and work absence rights', function () {
    this.timeout(3600);
    test.createSandbox();
    test.mockVerifyToken();
    test.cleanupSandbox();
    describe('when saving a new absence right', function () {
        test.clearDB();
        it('should save the absence right without errors', function (done) {
            var data = [];
            data.push({
                name: 'Wettelijk verlof',
                amount: 20,
                year: 2014,
                entity: test.dummyEntityId
            });

            async.each(data, function (absenceRight, iterateCallback) {
                AbsenceRightService.save(absenceRight).then(function () {
                    iterateCallback();
                });
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the new absence right when we list all absence rights', function (done) {
            AbsenceRightService.list().then(function (absencerights) {
                assert.equal(absencerights.length, 1);
                assert.equal(absencerights[0].name, 'Wettelijk verlof');
                done();
            });
        });
    });
    describe('when retrieving an absence right by id', function () {
        it('should retrieve the absence right', function (done) {
            AbsenceRightService.list().then(function (absencerights) {
                var absenceright = absencerights[0];
                AbsenceRightService.get(absenceright._id).then(function (retrievedAbsenceRight) {
                    assert.equal(retrievedAbsenceRight.name, 'Wettelijk verlof');
                    done();
                });
            });
        });
    });
    describe('when updating an existing absence right', function () {
        it('should update the absence right without errors', function (done) {
            AbsenceRightService.list().then(function (absencerights) {
                var absenceright = absencerights[0];
                absenceright.name = 'ADV';
                AbsenceRightService.update(absenceright._id, absenceright).then(function () {
                    done();
                });
            });
        });
        it('should return the new absence right data when we list all absence rights', function (done) {
            AbsenceRightService.list().then(function (absencerights) {
                assert.equal(absencerights.length, 1);
                assert.equal(absencerights[0].name, 'ADV');
                done();
            });
        });
    });
    describe('when deleting an existing absence right', function () {
        it('should update the absence right without errors', function (done) {
            AbsenceRightService.list().then(function (absencerights) {
                var absenceright = absencerights[0];
                AbsenceRightService.remove(absenceright._id).then(function () {
                    done();
                });
            });
        });
        it('should return the no absence rights when we list all absence rights', function (done) {
            AbsenceRightService.list().then(function (absencerights) {
                assert.equal(absencerights.length, 0);
                done();
            });
        });
    });
});