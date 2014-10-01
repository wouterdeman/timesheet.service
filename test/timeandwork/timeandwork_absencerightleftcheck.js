'use strict';

var test = require('../common');
var describe = test.describe;
var it = test.it;
var assert = test.assert;
var async = test.async;
var _ = require('lodash-node');
var AbsenceService = require('../../modules/timeandwork/service').AbsenceService;
var AbsenceRightService = require('../../modules/timeandwork/service').AbsenceRightService;
var SaldoService = require('../../modules/timeandwork/service').SaldoService;
var HolidayService = require('../../modules/timeandwork/service').HolidayService;

describe('Time and work absences', function() {
    this.timeout(3600);
    test.createSandbox();
    test.mockVerifyToken();
    test.cleanupSandbox();

    describe('when saving a week of absence and we have only 4 days rights left', function() {
        test.clearDB();
        it('should save the absence right without errors', function(done) {
            var data = [];
            data.push({
                name: 'Wettelijk verlof',
                amount: 4,
                year: 2014,
                entity: test.dummyEntityId,
                monthly: false,
                seqnr: 1
            });

            async.each(data, function(absenceRight, iterateCallback) {
                AbsenceRightService.save(absenceRight).then(function() {
                    iterateCallback();
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should save the absence without errors', function(done) {
            var data = [];
            data.push({
                from: new Date(2014, 0, 1),
                to: new Date(2014, 0, 7),
                amount: 1,
                prenoon: false,
                entity: test.dummyEntityId
            });

            async.each(data, function(absence, iterateCallback) {
                AbsenceService.save(absence).then(function() {
                    iterateCallback();
                }).fail(function(err) {
                    assert.equal(err, 'No saldo left');
                    done();
                });
            }, function(err) {
                if (err) {
                    done();
                }
            });
        });
        it('should return no absences because we do not have enough rights', function(done) {
            AbsenceService.list().then(function(absences) {
                assert.equal(absences.length, 0);
                done();
            });
        });
    });
    describe('when saving a week of absence and we have 2 absence rights left', function() {
        test.clearDB();
        it('should save the absence right without errors', function(done) {
            var data = [];
            data.push({
                name: 'Wettelijk verlof',
                amount: 3,
                year: 2014,
                entity: test.dummyEntityId,
                monthly: false,
                seqnr: 1
            });
            data.push({
                name: 'Recup',
                amount: 4,
                year: 2014,
                entity: test.dummyEntityId,
                monthly: false,
                seqnr: 2
            });

            async.each(data, function(absenceRight, iterateCallback) {
                AbsenceRightService.save(absenceRight).then(function() {
                    iterateCallback();
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should save the absence without errors', function(done) {
            var data = [];
            data.push({
                from: new Date(2014, 0, 1),
                to: new Date(2014, 0, 7),
                amount: 1,
                prenoon: false,
                entity: test.dummyEntityId
            });

            async.each(data, function(absence, iterateCallback) {
                AbsenceService.save(absence).then(function() {
                    iterateCallback();
                }).fail(function(err) {
                    console.log(err);
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return 5 absences because we skip weekends', function(done) {
            AbsenceService.list().then(function(absences) {
                assert.equal(absences.length, 5);
                done();
            });
        });
        it('should have 2 days of recup left', function(done) {
            SaldoService.list({
                entity: test.dummyEntityId,
                year: 2014
            }).then(function(absencerights) {
                var recup = _.find(absencerights, function(right) {
                    return right.name === 'Recup';
                });
                assert.equal(recup.amount - recup.used, 2);
                done();
            });
        });
    });
    describe('when saving a week of absence and we have a monthly absence right', function() {
        test.clearDB();
        it('should save the absence right without errors', function(done) {
            var data = [];
            data.push({
                name: 'Wettelijk verlof',
                amount: 10,
                year: 2014,
                entity: test.dummyEntityId,
                monthly: false,
                seqnr: 2
            });
            data.push({
                name: 'Recup',
                amount: 4,
                year: 2014,
                entity: test.dummyEntityId,
                monthly: true,
                seqnr: 1
            });

            async.each(data, function(absenceRight, iterateCallback) {
                AbsenceRightService.save(absenceRight).then(function() {
                    iterateCallback();
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should save the absence without errors', function(done) {
            var data = [];
            data.push({
                from: new Date(2014, 0, 1),
                to: new Date(2014, 0, 7),
                amount: 1,
                prenoon: false,
                entity: test.dummyEntityId
            });

            async.each(data, function(absence, iterateCallback) {
                AbsenceService.save(absence).then(function() {
                    iterateCallback();
                }).fail(function(err) {
                    console.log(err);
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return 5 absences because we skip weekends', function(done) {
            AbsenceService.list().then(function(absences) {
                assert.equal(absences.length, 5);
                done();
            });
        });
        it('should have 3 days of recup left', function(done) {
            SaldoService.list({
                entity: test.dummyEntityId,
                year: 2014
            }).then(function(absencerights) {
                var recup = _.find(absencerights, function(right) {
                    return right.name === 'Recup';
                });
                assert.equal(recup.amount - recup.used, 3);
                done();
            });
        });
    });

    describe('when saving a week of absence and we only have a monthly absence right', function() {
        test.clearDB();
        it('should save the absence right without errors', function(done) {
            var data = [];
            data.push({
                name: 'Recup',
                amount: 5,
                year: 2014,
                entity: test.dummyEntityId,
                monthly: true,
                seqnr: 1
            });

            async.each(data, function(absenceRight, iterateCallback) {
                AbsenceRightService.save(absenceRight).then(function() {
                    iterateCallback();
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should save the absence without errors', function(done) {
            var data = [];
            data.push({
                from: new Date(2014, 3, 1),
                to: new Date(2014, 3, 7),
                amount: 1,
                prenoon: false,
                entity: test.dummyEntityId
            });

            async.each(data, function(absence, iterateCallback) {
                AbsenceService.save(absence).then(function() {
                    iterateCallback();
                }).fail(function(err) {
                    assert.equal(err, 'No saldo left');
                    done();
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return no absences because we dont have enough right left', function(done) {
            AbsenceService.list().then(function(absences) {
                assert.equal(absences.length, 0);
                done();
            });
        });
        it('should have 4 days of recup left', function(done) {
            SaldoService.list({
                entity: test.dummyEntityId,
                year: 2014
            }).then(function(absencerights) {
                var recup = _.find(absencerights, function(right) {
                    return right.name === 'Recup';
                });
                assert.equal(recup.amount - recup.used, 5);
                done();
            });
        });
    });

    describe('when saving a week of absence and we only have a monthly absence right', function() {
        test.clearDB();
        it('should save the absence right without errors', function(done) {
            var data = [];
            data.push({
                name: 'Recup',
                amount: 5,
                year: 2014,
                entity: test.dummyEntityId,
                monthly: true,
                seqnr: 1
            });

            async.each(data, function(absenceRight, iterateCallback) {
                AbsenceRightService.save(absenceRight).then(function() {
                    iterateCallback();
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should save the absence without errors', function(done) {
            var data = [];
            data.push({
                from: new Date(2014, 4, 1),
                to: new Date(2014, 4, 7),
                amount: 1,
                prenoon: false,
                entity: test.dummyEntityId
            });

            async.each(data, function(absence, iterateCallback) {
                AbsenceService.save(absence).then(function() {
                    iterateCallback();
                }).fail(function(err) {
                    console.log(err);
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return 5 absences that were registered', function(done) {
            AbsenceService.list().then(function(absences) {
                assert.equal(absences.length, 5);
                done();
            });
        });
        it('should have 0 days of recup left', function(done) {
            SaldoService.list({
                entity: test.dummyEntityId,
                year: 2014
            }).then(function(absencerights) {
                var recup = _.find(absencerights, function(right) {
                    return right.name === 'Recup';
                });
                assert.equal(recup.amount - recup.used, 0);
                done();
            });
        });
    });

    describe('when saving a week of absence and we have a holiday happening that week', function() {
        test.clearDB();
        it('should save the absence right without errors', function(done) {
            var data = [];
            data.push({
                name: 'Recup',
                amount: 5,
                year: 2014,
                entity: test.dummyEntityId,
                monthly: true,
                seqnr: 1
            });

            async.each(data, function(absenceRight, iterateCallback) {
                AbsenceRightService.save(absenceRight).then(function() {
                    iterateCallback();
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should save the holiday without errors', function(done) {
            var data = [];
            data.push({
                name: 'Feest van de Arbeid',
                date: new Date(2014, 4, 1)
            });

            async.each(data, function(holiday, iterateCallback) {
                HolidayService.save(holiday).then(function() {
                    iterateCallback();
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should save the absence without errors', function(done) {
            var data = [];
            data.push({
                from: new Date(2014, 4, 1),
                to: new Date(2014, 4, 7),
                amount: 1,
                prenoon: false,
                entity: test.dummyEntityId
            });

            async.each(data, function(absence, iterateCallback) {
                AbsenceService.save(absence).then(function() {
                    iterateCallback();
                }).fail(function(err) {
                    console.log(err);
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return 4 absences that were registered', function(done) {
            AbsenceService.list().then(function(absences) {
                assert.equal(absences.length, 4);
                done();
            });
        });
        it('should have 1 days of recup left', function(done) {
            SaldoService.list({
                entity: test.dummyEntityId,
                year: 2014
            }).then(function(absencerights) {
                var recup = _.find(absencerights, function(right) {
                    return right.name === 'Recup';
                });
                assert.equal(recup.amount - recup.used, 1);
                done();
            });
        });
    });

    describe('when saving an absence on a holiday', function() {
        test.clearDB();
        it('should save the holiday without errors', function(done) {
            var data = [];
            data.push({
                name: 'Feest van de Arbeid',
                date: new Date(2014, 4, 1)
            });

            async.each(data, function(holiday, iterateCallback) {
                HolidayService.save(holiday).then(function() {
                    iterateCallback();
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should save the absence without errors', function(done) {
            var data = [];
            data.push({
                from: new Date(2014, 4, 1),
                to: new Date(2014, 4, 1),
                amount: 1,
                prenoon: false,
                entity: test.dummyEntityId
            });

            async.each(data, function(absence, iterateCallback) {
                AbsenceService.save(absence).then(function() {
                    iterateCallback();
                }).fail(function(err) {
                    assert.equal(err, 'The absences you try to register do not fall on working days');
                    done();
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
    });

    describe('when saving an absence on an existing absence', function() {
        test.clearDB();
        it('should save the absence right without errors', function(done) {
            var data = [];
            data.push({
                name: 'Recup',
                amount: 5,
                year: 2014,
                entity: test.dummyEntityId,
                monthly: true,
                seqnr: 1
            });

            async.each(data, function(absenceRight, iterateCallback) {
                AbsenceRightService.save(absenceRight).then(function() {
                    iterateCallback();
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should save the absence without errors', function(done) {
            var data = [];
            data.push({
                from: new Date(2014, 4, 1),
                to: new Date(2014, 4, 1),
                amount: 1,
                prenoon: false,
                entity: test.dummyEntityId
            });

            async.each(data, function(absence, iterateCallback) {
                AbsenceService.save(absence).then(function() {
                    iterateCallback();
                }).fail(function(err) {
                    console.log(err);
                });
            }, function(err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should save the absence without errors', function(done) {
            var data = [];
            data.push({
                from: new Date(2014, 4, 1),
                to: new Date(2014, 4, 1),
                amount: 1,
                prenoon: false,
                entity: test.dummyEntityId
            });

            async.each(data, function(absence, iterateCallback) {
                AbsenceService.save(absence).then(function() {
                    iterateCallback();
                }).fail(function(err) {
                    assert.equal(err, 'The absences you try to register do not fall on working days');
                    done();
                });
            }, function(err) {
                if (err) {
                    done();
                }
            });
        });
        it('should return 1 absences that were registered', function(done) {
            AbsenceService.list().then(function(absences) {
                assert.equal(absences.length, 1);
                done();
            });
        });
    });
});