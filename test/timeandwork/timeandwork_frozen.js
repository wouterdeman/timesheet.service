'use strict';

var test = require('../common');
var describe = test.describe;
var it = test.it;
var assert = test.assert;
var async = test.async;
var AbsenceService = require('../../modules/timeandwork/service').AbsenceService;

describe('Time and work freezing absences', function () {
    this.timeout(3600);
    test.createSandbox();
    test.mockVerifyToken();
    test.cleanupSandbox();
    describe('when saving freeze date', function () {
        test.clearDB();
        var expectedDate = new Date(2014, 2, 3);
        it('should be able to freeze', function (done) {
            AbsenceService.freeze(expectedDate).then(function () {
                done();
            }, function (err) {
                console.log(err);
            });
        });
        it('should return the new frozen date', function (done) {
            AbsenceService.getFrozen().then(function (frozen) {
                assert.equal(frozen.date.getDate(), expectedDate.getDate());
                assert.equal(frozen.date.getMonth(), expectedDate.getMonth());
                assert.equal(frozen.date.getFullYear(), expectedDate.getFullYear());
                done();
            }, function (err) {
                console.log(err);
            });
        });
        it('should not save the absence before the frozen date', function (done) {
            var data = [];
            data.push({
                from: new Date(2014, 0, 1),
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
                    assert.equal(err, 'Absences before 03/03/2014 are not allowed. Contact your administrator for more information!');
                    done();
                });
            }, function (err) {
                if (err) {
                    done();
                }
            });
        });
        it('should save the absence without errors after the frozen date', function (done) {
            var data = [];
            data.push({
                from: new Date(2014, 2, 4),
                to: new Date(2014, 2, 4),
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
});
