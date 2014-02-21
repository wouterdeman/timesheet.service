'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TokenSchema = new Schema({
    token: String,
    createDate: {
        type: Date,
        default: Date.now
    }
});

var GoogleAuthSchema = new Schema({
    email: String,
    refreshtoken: String
});

var AuthSchema = new Schema({
    provider: String,
    google: [GoogleAuthSchema],
    tokens: [TokenSchema],
    updated: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('GoogleAuth', GoogleAuthSchema);
mongoose.model('Token', TokenSchema);
var Auth = mongoose.model('Auth', AuthSchema);

exports.findOne = function (conditions, callback) {
    Auth.findOne(conditions, callback);
};

exports.find = function (conditions, callback) {
    Auth.find(conditions, callback);
};

exports.saveGoogleAuth = function (authData, callback) {
    Auth.update({
        entity: authData.entity
    }, {
        $pull: {
            google: {
                email: authData.email
            }
        },
        $push: {
            tokens: {
                $each: [{
                    token: authData.token
                }],
                $slice: -5
            }
        },
        provider: 'google'
    }, {
        upsert: true
    }, function (err) {
        if (err) {
            console.log(err);
            callback(err);
            return;
        }
        Auth.update({
            entity: authData.entity
        }, {
            $push: {
                google: {
                    email: authData.email,
                    refreshtoken: authData.refreshtoken
                }
            }
        }, {
            upsert: true
        }, function (err) {
            console.log(err);
            callback(err);
        });
    });
};

exports.findByToken = function (token, callback) {
    Auth.findOne({
        'tokens.token': token
    }, 'entity', null, callback);
};