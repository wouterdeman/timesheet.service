'use strict';

var models = require('../models');
var User = models.userModel;
var Q = require('q');
var TimeTracker = require('../modules/timetracker/service');
var AuthStore = require('../modules/authstore/service');

exports.saveCrumble = function (token, loc) {
    var deferred = Q.defer();
    AuthStore.verifyToken(token).then(function (entity) {
        if (!entity) {
            deferred.reject();
            return;
        }

        var data = {
            entity: entity,
            loc: loc
        };

        TimeTracker.saveCrumble(data).then(deferred.resolve).fail(deferred.reject);
    }).fail(deferred.reject);

    return deferred.promise;
};

exports.registerGoogleAuth = function (refreshtoken) {
    var deferred = Q.defer();

    AuthStore.registerGoogleAuth(refreshtoken, function (email, done) {
        console.log(email);
        User.findOne({
            emails: email
        }, function (err, user) {
            if (!err && user) {
                done(user._id);
            } else {
                deferred.reject(err);
            }
        });
    }).then(function (token) {
        deferred.resolve(token);
    });

    return deferred.promise;
};