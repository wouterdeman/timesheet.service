'use strict';

var services = require('../../services');
var timesheetService = services.timesheetService;
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var dummyActivityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e2');
var dummyObjectId = 'bf45c884d595b63c252494c5c32136017ecca3b395bd41cc1d597eb14d8ded9e';
var db = require('../mongoose');
var async = require('async');
var sinon = require('sinon');
var AuthStore = require('../../modules/authstore/service');
var Q = require('q');
var models = require('../../models');
var User = models.userModel;
var Customer = models.customerModel;

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

var mockGetCustomerById = function () {
    before(function (done) {
        sandbox.stub(Customer, 'getById', function (condition) {
            return new Q({
                _id: condition,
                name: 'Working for bITe'
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
    mockGetCustomerById();
    cleanupSandbox();
    describe('when retrieving the tracked time and updating the customer', function () {
        clearDB();
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
                timesheetService.saveCrumble(crumble.token, crumble.loc, crumble.object, crumble.objectdetails).then(function () {
                    iterateCallback();
                });
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the total tracked time per day for a given month and with no customer', function (done) {
            var getTrackedTimeAndCustomerData = {
                token: 'bla',
                month: new Date().getMonth(),
                year: new Date().getFullYear()
            };
            timesheetService.getTrackedTimeAndCustomer(getTrackedTimeAndCustomerData).then(function (trackedTime) {
                assert.equal(trackedTime.length, 1);
                assert.ok(trackedTime[0].date);
                assert.ok(trackedTime[0].duration);
                assert.ok(trackedTime[0].device);
                assert.ok(trackedTime[0].devicedetails);
                assert.ok(!trackedTime[0].customer);
                done();
            });
        });
        it('should be able to update the customer for a given device and day', function (done) {
            var data = {
                token: 'bla',
                day: new Date().getDate(),
                month: new Date().getMonth(),
                year: new Date().getFullYear(),
                device: dummyObjectId,
                customer: dummyActivityId
            };
            timesheetService.updateCustomerForTrackedTime(data).then(function () {
                done();
            });
        });
        it('should return the total tracked time per day for a given month and with the customer', function (done) {
            var getTrackedTimeAndCustomerData = {
                token: 'bla',
                month: new Date().getMonth(),
                year: new Date().getFullYear()
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

    describe('when retrieving the tracked time and updating the customer for an unexisting device', function () {
        clearDB();
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
                timesheetService.saveCrumble(crumble.token, crumble.loc, crumble.object, crumble.objectdetails).then(function () {
                    iterateCallback();
                });
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the total tracked time per day for a given month and with no customer', function (done) {
            var getTrackedTimeAndCustomerData = {
                token: 'bla',
                month: new Date().getMonth(),
                year: new Date().getFullYear()
            };
            timesheetService.getTrackedTimeAndCustomer(getTrackedTimeAndCustomerData).then(function (trackedTime) {
                assert.equal(trackedTime.length, 1);
                assert.ok(trackedTime[0].date);
                assert.ok(trackedTime[0].duration);
                assert.ok(trackedTime[0].device);
                assert.ok(trackedTime[0].devicedetails);
                assert.ok(!trackedTime[0].customer);
                done();
            });
        });
        it('should not update the tracked time data if the update query does not match', function (done) {
            var data = {
                token: 'bla',
                day: new Date().getDate(),
                month: new Date().getMonth(),
                year: new Date().getFullYear(),
                device: 'invalid device',
                customer: dummyActivityId
            };
            timesheetService.updateCustomerForTrackedTime(data).then(function () {
                done();
            });
        });
        it('should return the total tracked time per day for a given month and without the customer', function (done) {
            var getTrackedTimeAndCustomerData = {
                token: 'bla',
                month: new Date().getMonth(),
                year: new Date().getFullYear()
            };
            timesheetService.getTrackedTimeAndCustomer(getTrackedTimeAndCustomerData).then(function (trackedTime) {
                assert.equal(trackedTime.length, 1);
                assert.ok(trackedTime[0].date);
                assert.ok(trackedTime[0].duration);
                assert.ok(trackedTime[0].device);
                assert.ok(trackedTime[0].devicedetails);
                assert.ok(!trackedTime[0].customer);
                done();
            });
        });
    });

    describe('when retrieving the tracked time and updating the customer having multiple crumbles', function () {
        clearDB();
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
            data.push({
                token: 'bla',
                loc: [51.226956, 8.401744],
                object: dummyObjectId,
                objectdetails: {
                    devicestate: 'active',
                    devicetype: 'chrome',
                    appversion: '2.0.5'
                }
            });

            async.each(data, function (crumble, iterateCallback) {
                timesheetService.saveCrumble(crumble.token, crumble.loc, crumble.object, crumble.objectdetails).then(function () {
                    iterateCallback();
                });
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the total tracked time per day for a given month and with no customer', function (done) {
            var getTrackedTimeAndCustomerData = {
                token: 'bla',
                month: new Date().getMonth(),
                year: new Date().getFullYear()
            };
            timesheetService.getTrackedTimeAndCustomer(getTrackedTimeAndCustomerData).then(function (trackedTime) {
                assert.equal(trackedTime.length, 1);
                assert.ok(trackedTime[0].date);
                assert.ok(trackedTime[0].duration);
                assert.ok(trackedTime[0].device);
                assert.ok(trackedTime[0].devicedetails);
                assert.ok(!trackedTime[0].customer);
                done();
            });
        });
        it('should be able to update the customer for a given device and day', function (done) {
            var data = {
                token: 'bla',
                day: new Date().getDate(),
                month: new Date().getMonth(),
                year: new Date().getFullYear(),
                device: dummyObjectId,
                customer: dummyActivityId
            };
            timesheetService.updateCustomerForTrackedTime(data).then(function () {
                done();
            });
        });
        it('should return the total tracked time per day for a given month and with the customer', function (done) {
            var getTrackedTimeAndCustomerData = {
                token: 'bla',
                month: new Date().getMonth(),
                year: new Date().getFullYear()
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