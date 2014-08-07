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

exports.save = function (user) {
    return User.create(user);
};

exports.update = function (id, user) {
    return User.update({
        '_id': mongoose.Types.ObjectId('' + id)
    }, {
        $set: {
            emails: user.emails,
            firstname: user.firstname,
            lastname: user.lastname,
            updated: new Date()
        }
    }).exec();
};

exports.remove = function (id) {
    return User.findByIdAndRemove(id).exec();
};