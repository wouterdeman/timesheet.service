'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var AbsenceRightSchema = new Schema({
    name: String,
    amount: Number,
    year: Number,
    entity: ObjectId,
});

var AbsenceRight = mongoose.model('absenceright', AbsenceRightSchema);

exports.findOne = function (conditions) {
    return AbsenceRight.findOne(conditions).exec();
};

exports.find = function (conditions) {
    return AbsenceRight.find(conditions).sort({
        year: -1
    }).exec();
};

exports.findById = function (id) {
    return AbsenceRight.findOne({
        '_id': mongoose.Types.ObjectId(id)
    }).exec();
};

exports.save = function (absenceright) {
    return AbsenceRight.create(absenceright);
};

exports.update = function (id, absenceright) {
    return AbsenceRight.update({
        '_id': mongoose.Types.ObjectId('' + id)
    }, {
        $set: {
            name: absenceright.name,
            amount: absenceright.amount,
            year: absenceright.year,
            entity: absenceright.entity
        }
    }).exec();
};

exports.remove = function (id) {
    return AbsenceRight.findByIdAndRemove(id).exec();
};