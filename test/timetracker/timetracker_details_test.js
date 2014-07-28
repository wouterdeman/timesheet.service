'use strict';

var timetracker = require('../../modules/timetracker/service');
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
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

describe('Timetracker entity details', function () {
    this.timeout(3600);
    describe('when saving a crumble with details', function () {
        clearDB();
        it('should save without errors', function (done) {
            var data = {
                entity: dummyEntityId,
                details: {
                    type: 'BMW 316D',
                    platenumber: '1-AHQ-481',
                    area: 'Geel'
                },
                loc: [51.226956, 4.401744]
            };

            timetracker.saveCrumble(data).then(function () {
                done();
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
        it('and we should have still have our entity details', function (done) {
            assert.equal(todayscrumbleResult.details.type, 'BMW 316D');
            assert.equal(todayscrumbleResult.details.platenumber, '1-AHQ-481');
            assert.equal(todayscrumbleResult.details.area, 'Geel');
            done();
        });
    });
});