'use strict';

var timetracker = require('../modules/timetracker/service');
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var dummyActivityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e2');
var dummyActivityId2 = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e3');
var db = require('./mongoose');

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

describe('Timetracker zones', function () {
    this.timeout(3600);
    describe('when registering a zone with an activity adding another activity', function () {
        clearDB();
        it('should save without errors', function (done) {
            var data = {
                entity: dummyEntityId,
                loc: [51.226956, 4.401744],
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

        it('and we add another active activity', function (done) {
            timetracker.addActivityToZone({
                entity: dummyEntityId,
                loc: [51.226956, 4.401744],
                activity: dummyActivityId2,
                activityDetails: {
                    name: 'Pereltje',
                    street: 'Hoogstraat',
                    number: '17',
                    city: 'Mechelen',
                    postalcode: '2800',
                    mobilephone: '+32 15 41 91 43'
                }
            }).then(done);
        });

        var activeActivity;
        it('and we search for an active activity within 30 meters of the defined zone', function (done) {
            timetracker.getActiveActivity({
                entity: dummyEntityId,
                loc: [51.226956, 4.401744]
            }).then(function (activity) {
                activeActivity = activity;
                done();
            });
        });
        it('and we should have an active activity', function (done) {
            assert.ok(activeActivity.activity);
            done();
        });
        it('and it should be the last activity we added', function (done) {
            assert.equal(activeActivity.activityDetails.name, 'Pereltje');
            done();
        });
    });

    describe('when registering a zone with an activity adding the same activity', function () {
        clearDB();
        it('should save without errors', function (done) {
            var data = {
                entity: dummyEntityId,
                loc: [51.226956, 4.401744],
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

        it('and we add another active activity', function (done) {
            timetracker.addActivityToZone({
                entity: dummyEntityId,
                loc: [51.226956, 4.401744],
                activity: dummyActivityId,
                activityDetails: {
                    name: 'Pereltje',
                    street: 'Hoogstraat',
                    number: '17',
                    city: 'Mechelen',
                    postalcode: '2800',
                    mobilephone: '+32 15 41 91 43'
                }
            }).then(done);
        });

        var activeActivity;
        it('and we search for an active activity within 30 meters of the defined zone', function (done) {
            timetracker.getActiveActivity({
                entity: dummyEntityId,
                loc: [51.226956, 4.401744]
            }).then(function (activity) {
                activeActivity = activity;
                done();
            });
        });
        it('and we should have an active activity', function (done) {
            assert.ok(activeActivity.activity);
            done();
        });
        it('and it should still be the first activity we added', function (done) {
            assert.equal(activeActivity.activityDetails.name, 'Working for bITe');
            done();
        });
    });
});