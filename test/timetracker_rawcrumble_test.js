'use strict';

var timetracker = require('../modules/timetracker/service');
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var dummyEntityId2 = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e2');
var db = require('./mongoose');
var async = require('async');

var mocha = require('mocha');
var assert = require('assert');
var before = mocha.before;
var it = mocha.it;
var describe = mocha.describe;
var _ = require('lodash-node');

var clearDB = function () {
    before(function (done) {
        db.removeAllFromCollections(function () {
            done();
        });
    });
};

describe('Timetracker raw crumbles', function () {
    this.timeout(3600);
    describe('when retrieving the last raw crumbles for all entities', function () {
        clearDB();
        it('should save 3 crumbles without errors', function (done) {
            var data = [];

            data.push({
                entity: dummyEntityId,
                details: {
                    name: 'Joske Vermeulen'
                },
                loc: [51.226956, 4.401744],
                timeout: 0
            });


            data.push({
                entity: dummyEntityId,
                details: {
                    name: 'Joske Vermeulen'
                },
                loc: [55.226956, 4.401744],
                timeout: 150
            });

            data.push({
                entity: dummyEntityId2,
                details: {
                    name: 'Jefke Vermeulen'
                },
                loc: [60.226956, 4.401744],
                timeout: 150
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
        it('should return the last location for each entity', function (done) {
            timetracker.getLastLocations().then(function (lastlocations) {
                var dummy1 = _.find(lastlocations, function (lastlocation) {
                    return lastlocation.entity + '' === '52fd4c431a142e5826f0b1e1';
                });
                assert.equal(dummy1.details.name, 'Joske Vermeulen');
                assert.equal(dummy1.loc[0], 55.226956);
                done();
            });
        });
    });
});