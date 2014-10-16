'use strict';

var timetracker = require('../../modules/timetracker/service');
var ActivityLogService = timetracker.ActivityLogService;
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var dummyObjectId = 'bf45c884d595b63c252494c5c32136017ecca3b395bd41cc1d597eb14d8ded9e';
var db = require('../mongoose');

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

describe('Timetracker activity log service', function () {
    this.timeout(3600);
    describe('when saving a crumble we should track the object that send us the information', function () {
        clearDB();
        it('should save without errors', function (done) {
            var data = {
                entity: dummyEntityId,
                details: {
                    type: 'BMW 316D',
                    platenumber: '1-AHQ-481',
                    area: 'Geel'
                },
                object: dummyObjectId,
                objectdetails: {
                    devicestate: 'active',
                    devicetype: 'chrome',
                    appversion: '2.0.5'
                },
                loc: [51.226956, 4.401744]
            };

            timetracker.saveCrumble(data).then(function () {
                done();
            });
        });
        it('and we retrieve the activity log we should see 1 activity', function (done) {
            ActivityLogService.getLast20(dummyObjectId).then(function (activitylog) {
                assert.equal(activitylog.length, 1);
                done();
            });
        });
    });
});