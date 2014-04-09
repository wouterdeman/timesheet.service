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
    describe('when updating an existing zone with an activity', function () {
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

        var zone;
        it('and we retrieve the added zone', function (done) {
            timetracker.getZoneAndActivities({
                entity: dummyEntityId,
                loc: [51.226956, 4.401744]
            }).then(function (zonedata) {
                zone = zonedata;
                assert.equal(zone.zoneDetails.name, 'Business-IT-Engineering bvba');
                done();
            });
        });

        it('and we update the existing zone and activity details', function (done) {
            var data = {
                entity: dummyEntityId,
                loc: [51.226956, 4.401744],
                zone: zone._id,
                zoneDetails: {
                    name: 'bITe BVBA',
                    street: 'Puttestraat',
                    number: '105',
                    city: 'Begijnendijk',
                    postalcode: '3130',
                    mobilephone: '+32 476 29 87 56'
                },
                activity: dummyActivityId2,
                activityDetails: {
                    name: 'Working for bITe rocks'
                }
            };
            timetracker.updateZone(data).then(done);
        });

        it('and we retrieve the adjusted zone', function (done) {
            timetracker.getZoneAndActivities({
                entity: dummyEntityId,
                loc: [51.226956, 4.401744]
            }).then(function (zoneData) {
                zone = zoneData;
                assert.equal(zone.zoneDetails.name, 'bITe BVBA');
                done();
            });
        });
        it('and we should have 2 registered activities', function (done) {
            assert.equal(zone.activities.length, 2);
            done();
        });
        it('and we should have still have our zone details', function (done) {
            assert.equal(zone.zoneDetails.name, 'bITe BVBA');
            assert.equal(zone.zoneDetails.street, 'Puttestraat');
            assert.equal(zone.zoneDetails.mobilephone, '+32 476 29 87 56');
            done();
        });
    });
    describe('when updating an existing zone with the same activity', function () {
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

        var zone;
        it('and we retrieve the added zone', function (done) {
            timetracker.getZoneAndActivities({
                entity: dummyEntityId,
                loc: [51.226956, 4.401744]
            }).then(function (zonedata) {
                zone = zonedata;
                assert.equal(zone.zoneDetails.name, 'Business-IT-Engineering bvba');
                done();
            });
        });

        it('and we update the existing zone and activity details', function (done) {
            var data = {
                entity: dummyEntityId,
                loc: [51.226956, 4.401744],
                zone: zone._id,
                zoneDetails: {
                    name: 'bITe BVBA',
                    street: 'Puttestraat',
                    number: '105',
                    city: 'Begijnendijk',
                    postalcode: '3130',
                    mobilephone: '+32 476 29 87 56'
                },
                activity: dummyActivityId,
                activityDetails: {
                    name: 'Working for bITe rocks'
                }
            };
            timetracker.updateZone(data).then(done);
        });

        it('and we retrieve the adjusted zone', function (done) {
            timetracker.getZoneAndActivities({
                entity: dummyEntityId,
                loc: [51.226956, 4.401744]
            }).then(function (zoneData) {
                zone = zoneData;
                assert.equal(zone.zoneDetails.name, 'bITe BVBA');
                done();
            });
        });
        it('and we should have 1 registered activities', function (done) {
            assert.equal(zone.activities.length, 1);
            done();
        });
        it('and we should have still have our zone details', function (done) {
            assert.equal(zone.zoneDetails.name, 'bITe BVBA');
            assert.equal(zone.zoneDetails.street, 'Puttestraat');
            assert.equal(zone.zoneDetails.mobilephone, '+32 476 29 87 56');
            done();
        });
    });
});