'use strict';

var Requester = require('requester'),
    requester = new Requester({
        debug: 1
    });
var crypto = require('crypto');
var models = require('../models');
var Auth = models.authModel;
var Q = require('q');

var getGoogleAuthToken = function (refreshtoken) {
    var deferred = Q.defer();
    var authUrl = 'https://accounts.google.com/o/oauth2/token';
    var data = {
        /* jshint camelcase: false */
        refresh_token: refreshtoken,
        client_id: '607292229862-b0na3ohf67isteoqtfpaoal9j3j3al3h.apps.googleusercontent.com',
        client_secret: 'PfpT2sY3tLOlztx9J5FE2gdR',
        grant_type: 'refresh_token'
        /* jshint camelcase: true */
    };

    requester.post(authUrl, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        data: data
    }, function (resJson) {
        var response = JSON.parse(resJson);
        /* jshint camelcase: false */
        var accessToken = response.access_token;
        /* jshint camelcase: true */
        deferred.resolve(accessToken);
    });

    return deferred.promise;
};

var getUserEmail = function (accessToken) {
    var deferred = Q.defer();
    requester.get('https://www.googleapis.com/userinfo/email?alt=json&access_token=' + accessToken, {}, function (resg) {
        var responseGoogle = JSON.parse(resg);
        var email = responseGoogle.data.email;
        deferred.resolve(email);
    });

    return deferred.promise;
};

var generateTokenAndUpdateAuth = function (entity, email, refreshtoken) {
    var deferred = Q.defer();
    crypto.randomBytes(48, function (ex, buf) {
        var token = buf.toString('hex');

        Auth.saveGoogleAuth({
            token: token,
            email: email,
            refreshtoken: refreshtoken,
            entity: entity
        }, function (err) {
            if (err) {
                deferred.reject(err);
            }
            deferred.resolve(token);
        });
    });
    return deferred.promise;
};

exports.registerGoogleAuth = function (refreshToken, callback) {
    var deferred = Q.defer();

    getGoogleAuthToken(refreshToken).then(function (accessToken) {
        getUserEmail(accessToken).then(function (email) {
            callback(email, function (entity) {
                generateTokenAndUpdateAuth(entity, email, refreshToken).then(function (token) {
                    deferred.resolve(token);
                });
            });
        });
    });

    return deferred.promise;
};

exports.verifyToken = function (token) {
    var deferred = Q.defer();

    Auth.findByToken(token, function (err, entity) {
        console.log(entity);
        console.log(err);
        if (err || !entity) {
            deferred.reject(err);
        }
        deferred.resolve(entity);
    });

    return deferred.promise;
};