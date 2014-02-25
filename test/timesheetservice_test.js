'use strict';

var services = require('../services');
var timesheetService = services.timesheetService;
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var db = require('./mongoose');
var async = require('async');
var sinon = require('sinon');
var AuthStore = require('../modules/authstore/service');
var Q = require('q');
var models = require('../models');
var User = models.userModel;

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

var mockVerifyToken = function () {
    sinon.stub(AuthStore, 'verifyToken', function () {
        var deferred = Q.defer();

        deferred.resolve(dummyEntityId);

        return deferred.promise;
    });
};

describe('Timesheet service', function () {
    mockVerifyToken();
    describe('when saving 20 crumbles and getting the last 10 saved crumbles', function () {
        clearDB();
        it('should save 20 crumbles without errors', function (done) {
            var data = [];
            for (var i = 0; i < 20; i++) {
                data.push({
                    token: 'bla',
                    loc: [51.226956, 4.401744]
                });
            }

            async.each(data, function (crumble, iterateCallback) {
                timesheetService.saveCrumble(crumble.token, crumble.loc).then(iterateCallback);
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the last 10 crumbles when we ask for the last 10 crumbles', function (done) {
            sinon.stub(User, 'find', function (condition, callback) {
                callback(null, [{
                    _id: dummyEntityId,
                    name: 'Joske vermeulen'
                }]);
            });

            timesheetService.getLast10Entries().then(function (last10) {
                assert.equal(last10.length, 10);
                assert.equal(last10[0].user, 'Joske vermeulen');
                done();
            });
        });
    });
    describe('when saving 20 crumbles and getting the total count of crumbles', function () {
        clearDB();
        it('should save 20 crumbles without errors', function (done) {
            var data = [];
            for (var i = 0; i < 23; i++) {
                data.push({
                    token: 'bla',
                    loc: [51.226956, 4.401744]
                });
            }

            async.each(data, function (crumble, iterateCallback) {
                timesheetService.saveCrumble(crumble.token, crumble.loc).then(iterateCallback);
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the correct total amount', function (done) {
            timesheetService.getTotalCountOfEntries().then(function (count) {
                assert.equal(count, 23);
                done();
            });
        });
    });
    describe('when saving 4 crumbles and getting the total amount of time tracked', function () {
        clearDB();
        it('should save 4 crumbles without errors', function (done) {
            var data = [];
            for (var i = 0; i < 4; i++) {
                data.push({
                    token: 'bla',
                    loc: [51.226956, 4.401744]
                });
            }

            async.each(data, function (crumble, iterateCallback) {
                timesheetService.saveCrumble(crumble.token, crumble.loc).then(iterateCallback);
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the correct total amount of time spent', function (done) {
            timesheetService.getTotalAmountOfTrackedMinutes().then(function (amount) {
                assert.equal(amount, 4 * 5);
                done();
            });
        });
    });
});