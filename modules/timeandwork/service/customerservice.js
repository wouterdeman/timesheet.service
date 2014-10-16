'use strict';

var models = require('../models');
var Customer = models.customerModel;
var Q = require('q');

exports.getCustomers = function () {
    var deferred = Q.defer();
    /*AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }
        User.findById(entity, function (err, user) {
            if (err && !user) {
                deferred.reject(err);
                return;
            }*/

    Customer.getAll().then(deferred.resolve, deferred.reject);
    //});
    //}).fail(deferred.reject);

    return deferred.promise;
};