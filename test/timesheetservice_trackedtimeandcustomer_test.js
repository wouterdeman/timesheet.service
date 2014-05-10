'use strict';

var services = require('../services');
var timesheetService = services.timesheetService;
var timetracker = require('../modules/timetracker/service');
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var dummyActivityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e2');
var dummyObjectId = 'bf45c884d595b63c252494c5c32136017ecca3b395bd41cc1d597eb14d8ded9e';
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
var after = mocha.after;
var it = mocha.it;
var describe = mocha.describe;
var sandbox;

var clearDB = function () {
    before(function (done) {
        db.removeAllFromCollections(function () {
            done();
        });
    });
};

var mockVerifyToken = function () {
    before(function (done) {
        sandbox.stub(AuthStore, 'verifyToken', function () {
            var deferred = Q.defer();

            deferred.resolve(dummyEntityId);

            return deferred.promise;
        });
        done();
    });
};

var mockUserFindById = function () {
    before(function (done) {
        sandbox.stub(User, 'findById', function (condition, callback) {
            callback(null, {
                _id: dummyEntityId,
                firstname: 'Joske',
                lastname: 'Vermeulen',
                emails: ['joske.vermeulen@gmail.com']
            });
        });
        done();
    });
};

var mockUserFindByEmail = function () {
    before(function (done) {
        sandbox.stub(User, 'findByEmail', function (condition, callback) {
            callback(null, {
                _id: dummyEntityId,
                firstname: 'Joske',
                lastname: 'Vermeulen',
                emails: ['joske.vermeulen@gmail.com']
            });
        });
        done();
    });
};

var createSandbox = function () {
    before(function (done) {
        sandbox = sinon.sandbox.create();
        done();
    });
};

var cleanupSandbox = function () {
    after(function (done) {
        sandbox.restore();
        done();
    });
};

describe('Timesheet service', function () {
    this.timeout(3600);
    createSandbox();
    mockVerifyToken();
    mockUserFindById();
    mockUserFindByEmail();
    cleanupSandbox();
    describe('when saving crumbles and getting the the tracked customer time data', function () {
        clearDB();
        it('should save a zone without errors', function (done) {
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
        it('should save crumbles without errors', function (done) {
            var data = [];
            data.push({
                token: 'bla',
                loc: [51.226956, 4.401744],
                object: dummyObjectId,
                objectdetails: {
                    devicestate: 'active',
                    devicetype: 'chrome',
                    appversion: '2.0.5'
                }
            });

            async.each(data, function (crumble, iterateCallback) {
                timesheetService.saveCrumble(crumble.token, crumble.loc, crumble.object, crumble.objectdetails).then(iterateCallback);
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the total tracked time per day for a given month', function (done) {
            var getTrackedTimeAndCustomerData = {
                token: 'bla',
                month: 4,
                year: 2014
            };
            timesheetService.getTrackedTimeAndCustomer(getTrackedTimeAndCustomerData).then(function (trackedTime) {
                assert.equal(trackedTime.length, 1);
                assert.ok(trackedTime[0].date);
                assert.ok(trackedTime[0].duration);
                assert.ok(trackedTime[0].device);
                assert.ok(trackedTime[0].devicedetails);
                assert.ok(trackedTime[0].customer);
                done();
            });
        });
    });
});