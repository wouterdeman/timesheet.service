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
        db.dropCollections(function () {
            done();
        });
    });
};

describe('Timetracker last10', function () {
    describe('when saving 20 crumbles and getting the last 10 saved crumbles', function () {
        clearDB();
        it('should save 20 crumbles without errors', function (done) {
            var data = [];

            for (var i = 0; i < 20; i++) {
                data.push({
                    entity: dummyEntityId,
                    details: {
                        name: 'Joske Vermeulen'
                    },
                    loc: [51.226956 + i, 4.401744]
                });
            }

            async.each(data, function (crumble, iterateCallback) {
                timetracker.saveCrumble(crumble).then(iterateCallback);
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return 20 crumbles when we ask for todays crumbles', function (done) {
            timetracker.getTodaysCrumbles({
                entity: dummyEntityId
            }).then(function (todayscrumbles) {
                assert.equal(todayscrumbles.crumbles.length, 20);
                done();
            });
        });
        it('should return the last 10 crumbles when we ask for the last 10 crumbles', function (done) {
            timetracker.getLast10Crumbles().then(function (last10crumbles) {
                assert.equal(last10crumbles.length, 10);
                assert.equal(last10crumbles[0].details.name, 'Joske Vermeulen');
                done();
            });
        });
    });
});