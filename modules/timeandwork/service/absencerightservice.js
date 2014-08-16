'use strict';

var models = require('../models');
var AbsenceRightModel = models.absenceRightModel;
var Q = require('q');

exports.save = function (absenceright) {
    var deferred = Q.defer();
    AbsenceRightModel.save(absenceright).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.list = function (conditions) {
    var deferred = Q.defer();
    AbsenceRightModel.find(conditions).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.update = function (id, absenceright) {
    var deferred = Q.defer();
    AbsenceRightModel.update(id, absenceright).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.remove = function (id) {
    var deferred = Q.defer();
    AbsenceRightModel.remove(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.get = function (id) {
    var deferred = Q.defer();
    AbsenceRightModel.findById(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};