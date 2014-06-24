'use strict';

var services = require('../services');
var timesheetService = services.timesheetService;
var timetracker = require('../modules/timetracker/service');
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var dummyActivityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e2');
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
        sandbox.stub(User, 'findById', function (condition) {
            return new Q({
                _id: condition,
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
        sandbox.stub(User, 'findByEmail', function () {
            return new Q({
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
                loc: [51.226956, 4.401744]
            });

            async.each(data, function (crumble, iterateCallback) {
                timesheetService.saveCrumble(crumble.token, crumble.loc).then(function () {
                    iterateCallback();
                });
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the total tracked time per day for a given month and email', function (done) {
            var getTrackedTimeForCustomerData = {
                email: 'joske.vermeulen@gmail.com',
                month: new Date().getMonth(),
                year: new Date().getFullYear(),
                customer: '52fd4c431a142e5826f0b1e2'
            };
            timesheetService.getTrackedTimeForCustomer(getTrackedTimeForCustomerData).then(function (trackedTime) {
                assert.equal(trackedTime.length, 1);
                assert.ok(trackedTime[0].date);
                assert.ok(trackedTime[0].duration);
                done();
            });
        });
    });
});