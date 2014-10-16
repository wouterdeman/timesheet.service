'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FreezeSchema = new Schema({
    date: Date
});

var Freeze = mongoose.model('freeze', FreezeSchema);

exports.findOne = function(conditions) {
    conditions = conditions || {};
    return Freeze.findOne(conditions).exec();
};

exports.find = function(conditions) {
    return Freeze.find(conditions).sort({
        date: -1
    }).exec();
};

exports.save = function(date) {
    return Freeze.update({}, {
        $set: {
            date: date
        }
    }, {
        upsert: true
    }).exec();
};