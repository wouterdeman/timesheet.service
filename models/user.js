'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    firstname: String,
    lastname: String,
    emails: [String],
    updated: {
        type: Date,
        default: Date.now
    }
});

var User = mongoose.model('User', UserSchema);

exports.findOne = function (conditions) {
    return User.findOne(conditions).exec();
};

exports.find = function (conditions) {
    return User.find(conditions).exec();
};

exports.findById = function (id) {
    return User.findOne({
        '_id': mongoose.Types.ObjectId(id)
    }).exec();
};

exports.findByEmail = function (email) {
    return User.find({
        emails: email
    }).lean().exec();
};