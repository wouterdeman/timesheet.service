'use strict';

var models = require('../models');
var AbsenceModel = models.absenceModel;
var Q = require('q');

exports.save = function (absence) {
    var deferred = Q.defer();
    AbsenceModel.save(absence).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.list = function () {
    var deferred = Q.defer();
    AbsenceModel.find().then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.update = function (id, absence) {
    var deferred = Q.defer();
    AbsenceModel.update(id, absence).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.remove = function (id) {
    var deferred = Q.defer();
    AbsenceModel.remove(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};

exports.get = function (id) {
    var deferred = Q.defer();
    AbsenceModel.findById(id).then(deferred.resolve, deferred.reject);
    return deferred.promise;
};