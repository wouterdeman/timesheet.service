'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var AbsenceSchema = new Schema({
    date: Date,
    entity: ObjectId,
    absenceright: ObjectId,
    amount: Number,
    prenoon: Boolean,
    year: Number
});

var Absence = mongoose.model('absence', AbsenceSchema);

exports.findOne = function (conditions) {
    return Absence.findOne(conditions).exec();
};

exports.find = function (conditions) {
    return Absence.find(conditions).sort({
        date: -1
    }).exec();
};

exports.findById = function (id) {
    return Absence.findOne({
        '_id': mongoose.Types.ObjectId(id)
    }).exec();
};

exports.save = function (absence) {
    return Absence.create(absence);
};

exports.update = function (id, absence) {
    return Absence.update({
        '_id': mongoose.Types.ObjectId('' + id)
    }, {
        $set: {
            date: absence.date,
            entity: absence.entity,
            absenceright: absence.absenceright,
            amount: absence.amount,
            prenoon: absence.prenoon,
            year: absence.date.getFullYear()
        }
    }).exec();
};

exports.remove = function (id) {
    return Absence.findByIdAndRemove(id).exec();
};