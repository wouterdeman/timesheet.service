'use strict';

var models = require('../models');
var HolidayModel = models.holidayModel;
var Q = require('q');

exports.save = function (holiday) {
    var deferred = Q.defer();
    HolidayModel.save(holiday).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.list = function () {
    var deferred = Q.defer();
    HolidayModel.find().then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.update = function (id, holiday) {
    var deferred = Q.defer();
    HolidayModel.update(id, holiday).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.remove = function (id) {
    var deferred = Q.defer();
    HolidayModel.remove(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.get = function (id) {
    var deferred = Q.defer();
    HolidayModel.findById(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};