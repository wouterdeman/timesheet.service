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
var User = require('../../modules/userstore/models').userModel;

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
    describe('when saving 20 crumbles and getting the total count of crumbles', function () {
        clearDB();
        it('should save 20 crumbles without errors', function (done) {
            var data = [];
            for (var i = 0; i < 23; i++) {
                data.push({
                    token: 'bla',
                    loc: [51.226956 + i, 4.401744]
                });
            }

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
        it('should return the correct total amount', function (done) {
            timesheetService.getTotalCountOfEntries().then(function (count) {
                assert.equal(count, 23);
                done();
            });
        });
    });
});