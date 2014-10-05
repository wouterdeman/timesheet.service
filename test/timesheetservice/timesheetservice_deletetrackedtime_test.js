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
var models = require('../../modules/timeandwork/models');
var User = require('../../modules/userstore/models').userModel;
var Customer = models.customerModel;

var mocha = require('mocha');
var assert = require('assert');
var before = mocha.before;
var after = mocha.after;
var it = mocha.it;
var describe = mocha.describe;
var sandbox;
var expect = require('chai').expect;

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
                },
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
        var reference;
        it('should return the total tracked time per day for a given month and with no customer', function (done) {
            var getTrackedTimeAndCustomerData = {
                token: 'bla',
                month: new Date().getMonth(),
                year: new Date().getFullYear()
            };
            timesheetService.getTrackedTimeAndCustomer(getTrackedTimeAndCustomerData).then(function (trackedTime) {
                try {
                    expect(trackedTime).to.have.length(1);
                    assert.equal(trackedTime.length, 1);
                    assert.ok(trackedTime[0].date);
                    assert.ok(trackedTime[0].duration);
                    assert.ok(trackedTime[0].device);
                    assert.ok(trackedTime[0].devicedetails);
                    assert.ok(trackedTime[0].reference);
                    reference = trackedTime[0].reference;
                    assert.ok(!trackedTime[0].customer);
                    done();
                } catch (x) {
                    done(x);
                }
            });
        });
        it('should be able to delete a crumble using a reference crumble', function (done) {
            var data = {
                token: 'bla',
                reference: reference
            };
            timesheetService.deleteReferencedTrackedTime(data).then(function () {
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
                assert.equal(trackedTime.length, 0);
                done();
            });
        });
    });
});