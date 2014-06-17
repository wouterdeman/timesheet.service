'use strict';

var timetracker = require('../modules/timetracker/service');
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var db = require('./mongoose');
var async = require('async');

var mocha = require('mocha');
var assert = require('assert');
var before = mocha.before;
var it = mocha.it;
var describe = mocha.describe;

var clearDB = function () {
    before(function (done) {
        db.removeAllFromCollections(function () {
            done();
        });
    });
};

describe('Timetracker detect same location', function () {
    this.timeout(3600000);
    describe('when saving crumbles for the same location', function () {
        clearDB();
        var startTime = new Date();
        it('should save our crumbles without errors', function (done) {
            var data = [];

            data.push({
                entity: dummyEntityId,
                details: {
                    name: 'Joske Vermeulen'
                },
                loc: [50.974538100000004, 4.6343685],
                timeout: 0
            });

            data.push({
                entity: dummyEntityId,
                details: {
                    name: 'Joske Vermeulen'
                },
                loc: [50.9743959, 4.634516],
                timeout: 250
            });

            data.push({
                entity: dummyEntityId,
                details: {
                    name: 'Joske Vermeulen'
                },
                loc: [50.9744421, 4.6344674999999995],
                timeout: 500
            });

            data.push({
                entity: dummyEntityId,
                details: {
                    name: 'Joske Vermeulen'
                },
                loc: [50.9744841, 4.6344109],
                timeout: 750
            });


            data.push({
                entity: dummyEntityId,
                details: {
                    name: 'Joske Vermeulen'
                },
                loc: [50.9744935, 4.6344031999999995],
                timeout: 3000
            });

            async.each(data, function (crumble, iterateCallback) {
                setTimeout(function () {
                    timetracker.saveCrumble(crumble).then(function () {
                        iterateCallback();
                    });
                }, crumble.timeout);
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should have combined these crumbles in one with a start and end time', function (done) {
            timetracker.getLastLocations().then(function (lastlocations) {
                assert.equal(lastlocations[0].details.name, 'Joske Vermeulen');
                assert.equal(lastlocations[0].loc[0], 50.974538100000004);
                assert.equal(lastlocations.length, 1);
                assert.equal(startTime < lastlocations[0].endtime, true);
                done();
            });
        });
    });
    describe('when saving crumbles from 2 devices for the same locations', function () {
        clearDB();
        var startTime = new Date();
        it('should save our crumbles without errors', function (done) {
            var data = [];

            // location 1
            data.push({
                entity: dummyEntityId,
                details: {
                    name: 'Joske Vermeulen',
                    device: 'pc'
                },
                loc: [50.974538100000004, 4.6343685],
                timeout: 0
            });

            // location 2
            data.push({
                entity: dummyEntityId,
                details: {
                    name: 'Joske Vermeulen',
                    device: 'tablet'
                },
                loc: [50.849166999999994, 4.265556],
                timeout: 500
            });

            // location 1
            data.push({
                entity: dummyEntityId,
                details: {
                    name: 'Joske Vermeulen',
                    device: 'pc'
                },
                loc: [50.9743959, 4.634516],
                timeout: 1000
            });

            // location 2
            data.push({
                entity: dummyEntityId,
                details: {
                    name: 'Joske Vermeulen',
                    device: 'tablet'
                },
                loc: [50.849166999999994, 4.265556],
                timeout: 1500
            });

            async.each(data, function (crumble, iterateCallback) {
                setTimeout(function () {
                    timetracker.saveCrumble(crumble).then(function () {
                        iterateCallback();
                    });
                }, crumble.timeout);
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should have combined these crumbles in one with a start and end time', function (done) {
            timetracker.getLast10Crumbles().then(function (last10) {
                assert.equal(last10[0].details.name, 'Joske Vermeulen');
                assert.equal(last10[0].loc[0], 50.849166999999994);
                assert.equal(last10[1].loc[0], 50.974538100000004);
                assert.equal(last10.length, 2);
                assert.equal(startTime < last10[0].endtime, true);
                done();
            });
        });
    });
});