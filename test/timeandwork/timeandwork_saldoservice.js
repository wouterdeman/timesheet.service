'use strict';

var test = require('../common');
var describe = test.describe;
var it = test.it;
var assert = test.assert;
var async = test.async;
var AbsenceRightService = require('../../modules/timeandwork/service').AbsenceRightService;
var AbsenceService = require('../../modules/timeandwork/service').AbsenceService;
var SaldoService = require('../../modules/timeandwork/service').SaldoService;

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
                entity: test.dummyEntityId,
                monthly: false,
                seqnr: 1
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
        it('should save the absence without errors', function (done) {
            var data = [];
            data.push({
                date: new Date(2014, 1, 1),
                amount: 1,
                prenoon: false,
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
        it('should return the correct saldo indicating one day is used', function (done) {
            SaldoService.list().then(function (saldos) {
                assert.equal(saldos.length, 1);
                assert.equal(saldos[0].used, 1);
                done();
            });
        });
    });
});