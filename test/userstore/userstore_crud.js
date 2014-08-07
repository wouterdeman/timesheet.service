'use strict';

var test = require('../common');
var describe = test.describe;
var it = test.it;
var assert = test.assert;
var async = test.async;
var userservice = require('../../modules/userstore/service');

describe('Userstore', function () {
    this.timeout(3600);
    test.createSandbox();
    test.mockVerifyToken();
    test.cleanupSandbox();
    describe('when saving a new user', function () {
        test.clearDB();
        it('should save the user without errors', function (done) {
            var data = [];
            data.push({
                emails: [
                    'wouter.deman@bite.be',
                    'wouter386@gmail.com'
                ],
                firstname: 'Wouter',
                lastname: 'Deman'
            });

            async.each(data, function (user, iterateCallback) {
                userservice.save(user).then(function () {
                    iterateCallback();
                });
            }, function (err) {
                if (!err) {
                    done();
                }
            });
        });
        it('should return the new user when we list all users', function (done) {
            userservice.list().then(function (users) {
                assert.equal(users.length, 1);
                assert.equal(users[0].firstname, 'Wouter');
                done();
            });
        });
    });
    describe('when retrieving a user by id', function () {
        it('should retrieve the user', function (done) {
            userservice.list().then(function (users) {
                var user = users[0];
                userservice.get(user._id).then(function (retrievedUser) {
                    assert.equal(retrievedUser.firstname, 'Wouter');
                    done();
                });
            });
        });
    });
    describe('when updating an existing user', function () {
        it('should update the user without errors', function (done) {
            userservice.list().then(function (users) {
                var user = users[0];
                user.firstname = 'Joske';
                userservice.update(user._id, user).then(function () {
                    done();
                });
            });
        });
        it('should return the new user data when we list all users', function (done) {
            userservice.list().then(function (users) {
                assert.equal(users.length, 1);
                assert.equal(users[0].firstname, 'Joske');
                done();
            });
        });
    });
    describe('when deleting an existing user', function () {
        it('should update the user without errors', function (done) {
            userservice.list().then(function (users) {
                var user = users[0];
                userservice.remove(user._id).then(function () {
                    done();
                });
            });
        });
        it('should return the no users when we list all users', function (done) {
            userservice.list().then(function (users) {
                assert.equal(users.length, 0);
                done();
            });
        });
    });
});