'use strict';

var timetracker = require('../modules/timetracker/service');
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var dummyObjectId = 'bf45c884d595b63c252494c5c32136017ecca3b395bd41cc1d597eb14d8ded9e';
var db = require('./mongoose');

var mocha = require('mocha');
var assert = require('assert');
var before = mocha.before;
var it = mocha.it;
var describe = mocha.describe;

var clearDB = function () {
    before(function (done) {
        db.dropCollections(function () {
            done();
        });
    });
};

describe('Timetracker entity object tracking', function () {
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

            timetracker.saveCrumble(data).then(done);
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
        it('and we should have still have our entity details', function (done) {
            assert.equal(todayscrumbleResult.details.type, 'BMW 316D');
            assert.equal(todayscrumbleResult.details.platenumber, '1-AHQ-481');
            assert.equal(todayscrumbleResult.details.area, 'Geel');
            done();
        });
        it('and we should have crumbles with their tracked object information', function (done) {
            assert.equal(todayscrumbleResult.crumbles[0].object, dummyObjectId);
            assert.equal(todayscrumbleResult.crumbles[0].objectdetails.devicestate, 'active');
            assert.equal(todayscrumbleResult.crumbles[0].objectdetails.devicetype, 'chrome');
            done();
        });
    });
});