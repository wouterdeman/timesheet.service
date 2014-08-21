'use strict';

var mongoose = require('mongoose');
var db = require('../mongoose');
exports.async = require('async');
var sinon = require('sinon');
var AuthStore = require('../../modules/authstore/service');
var Q = require('q');
exports.Q = Q;
var dummyEntityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e1');
var dummyActivityId = mongoose.Types.ObjectId('52fd4c431a142e5826f0b1e2');
exports.dummyEntityId = dummyEntityId;
exports.dummyActivityId = dummyActivityId;

var mocha = require('mocha');
exports.assert = require('assert');
exports.before = mocha.before;
exports.after = mocha.after;
exports.it = mocha.it;
exports.before = mocha.before;
exports.describe = mocha.describe;

var sandbox;

exports.clearDB = function () {
    mocha.before(function (done) {
        db.removeAllFromCollections(function () {
            done();
        });
    });
};

exports.mockVerifyToken = function () {
    mocha.before(function (done) {
        sandbox.stub(AuthStore, 'verifyToken', function () {
            var deferred = Q.defer();

            deferred.resolve(dummyEntityId);

            return deferred.promise;
        });
        done();
    });
};

exports.createSandbox = function () {
    mocha.before(function (done) {
        sandbox = sinon.sandbox.create();
        done();
    });
};

exports.cleanupSandbox = function () {
    mocha.after(function (done) {
        sandbox.restore();
        done();
    });
};