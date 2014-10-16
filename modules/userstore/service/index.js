'use strict';

var models = require('../models');
var UserModel = models.userModel;
var Q = require('q');

exports.save = function (user) {
    var deferred = Q.defer();
    UserModel.save(user).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.list = function () {
    var deferred = Q.defer();
    UserModel.find().then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.update = function (id, user) {
    var deferred = Q.defer();
    UserModel.update(id, user).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.remove = function (id) {
    var deferred = Q.defer();
    UserModel.remove(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.get = function (id) {
    var deferred = Q.defer();
    UserModel.findById(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};