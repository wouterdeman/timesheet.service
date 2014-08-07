'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HolidaySchema = new Schema({
    name: String,
    date: Date
});

var Holiday = mongoose.model('holiday', HolidaySchema);

exports.findOne = function (conditions) {
    return Holiday.findOne(conditions).exec();
};

exports.find = function (conditions) {
    return Holiday.find(conditions).exec();
};

exports.findById = function (id) {
    return Holiday.findOne({
        '_id': mongoose.Types.ObjectId(id)
    }).exec();
};

exports.save = function (holiday) {
    return Holiday.create(holiday);
};

exports.update = function (id, holiday) {
    return Holiday.update({
        '_id': mongoose.Types.ObjectId('' + id)
    }, {
        $set: {
            name: holiday.name,
            date: holiday.date
        }
    }).exec();
};

exports.remove = function (id) {
    return Holiday.findByIdAndRemove(id).exec();
};