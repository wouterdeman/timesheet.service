'use strict';

var Q = require('q');
var models = require('../models');
var locationModel = models.locationModel;

exports.saveLocation = function (data) {
    var deferred = Q.defer();

    var location = locationModel.create(data);
    locationModel.save(location, function (error, savedLocation) {
        if (error) {
            deferred.reject(error);
        }

        deferred.resolve(savedLocation);
    });

    return deferred.promise;
};

