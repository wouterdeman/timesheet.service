'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
require('date-utils');

var objectTrackingSchema = new Schema({
    entity: ObjectId,
    object: String,
    details: Schema.Types.Mixed,
    lastmodified: { type: Date, default: Date.now }
});

var ObjectTracking = mongoose.model('objecttracking', objectTrackingSchema);

exports.save = function (objectTrackingData, callback) {
    ObjectTracking.update({
        entity: objectTrackingData.entity,
        object: objectTrackingData.object
    }, {
        $set: {
            details: objectTrackingData.details
        }
    }, {
        upsert: true
    }, function (err) {
        callback(err);
    });
};

exports.create = function (data) {
    return {
        entity: data.entity,
        object: data.object,
        details: data.objectdetails
    };
};

exports.find = function (query, callback) {
    ObjectTracking.find(query, function (err, objecttrackings) {
        callback(err, objecttrackings);
    });
};

exports.aggregate = function (aggregate, callback) {
    ObjectTracking.aggregate(aggregate).exec(callback);
};
