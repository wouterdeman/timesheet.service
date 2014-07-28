'use strict';

var services = require('../../services');
var timesheetService = services.timesheetService;
var mongoose = require('mongoose');
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var db = require('../mongoose');
var async = require('async');
var sinon = require('sinon');
var AuthStore = require('../../modules/authstore/service');
var Q = require('q');
var models = require('../../models');
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
    cleanupSandbox();
    describe('when saving a customer', function () {
        clearDB();
        it('should save the customer without errors', function (done) {
            var data = [];
            data.push({
                name: 'bITe',
                street: 'Puttestraat',
                number: '105',
                city: 'Begijnendijk',
                postalcode: '3130',
                phone: '+32 476 29 87 56'
            });

            async.each(data, function (customer, iterateCallback) {
                timesheetService.saveCustomer(null, customer).then(function () {
                    iterateCallback();
                });
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the new customer when we list all customers', function (done) {
            timesheetService.getCustomers(null).then(function (customers) {
                assert.equal(customers.length, 1);
                assert.equal(customers[0].name, 'bITe');
                done();
            });
        });
    });
});