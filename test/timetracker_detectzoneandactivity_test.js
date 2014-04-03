'use strict';

var timetracker = require('../modules/timetracker/service');
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var dummyActivityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e2');
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

describe('Timetracker detect zone and active activity', function () {
    this.timeout(3600000);
    describe('when saving crumbles for the same location with an active zone/activity', function () {
        clearDB();
        it('we register our zone', function (done) {
            var data = {
                entity: dummyEntityId,
                loc: [50.974538100000004, 4.6343685],
                zoneDetails: {
                    name: 'Business-IT-Engineering bvba',
                    street: 'Puttestraat',
                    number: '105',
                    city: 'Begijnendijk',
                    postalcode: '3130',
                    mobilephone: '+32 476 29 87 56'
                },
                activity: dummyActivityId,
                activityDetails: {
                    name: 'Working for bITe'
                }
            };
            timetracker.saveZone(data).then(done);
        });
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

            async.each(data, function (crumble, iterateCallback) {
                setTimeout(function () {
                    timetracker.saveCrumble(crumble).then(iterateCallback);
                }, crumble.timeout);
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        var todayscrumbleResult;
        it('and we retrieve todays crumbles', function (done) {
            timetracker.getTodaysCrumbles({
                entity: dummyEntityId
            }).then(function (todayscrumble) {
                todayscrumbleResult = todayscrumble;
                done();
            });
        });
        it('and we should have one crumble', function (done) {
            assert.equal(todayscrumbleResult.crumbles.length, 1);
            done();
        });
        it('should have added zone and activity details', function (done) {
            assert.equal(todayscrumbleResult.details.name, 'Joske Vermeulen');
            assert.equal(todayscrumbleResult.crumbles[0].loc[0], 50.974538100000004);
            assert.equal(todayscrumbleResult.crumbles[0].activityDetails.name, 'Working for bITe');
            done();
        });
    });

    describe('when saving crumbles for the same location with no active zone/activity', function () {
        clearDB();
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

            async.each(data, function (crumble, iterateCallback) {
                setTimeout(function () {
                    timetracker.saveCrumble(crumble).then(iterateCallback);
                }, crumble.timeout);
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        var todayscrumbleResult;
        it('and we retrieve todays crumbles', function (done) {
            timetracker.getTodaysCrumbles({
                entity: dummyEntityId
            }).then(function (todayscrumble) {
                todayscrumbleResult = todayscrumble;
                done();
            });
        });
        it('and we should have one crumble', function (done) {
            assert.equal(todayscrumbleResult.crumbles.length, 1);
            done();
        });
        it('should have no zone/activity details', function (done) {
            assert.equal(todayscrumbleResult.details.name, 'Joske Vermeulen');
            assert.equal(todayscrumbleResult.crumbles[0].loc[0], 50.974538100000004);
            assert.equal(todayscrumbleResult.crumbles[0].activityDetails, undefined);
            done();
        });
    });
});