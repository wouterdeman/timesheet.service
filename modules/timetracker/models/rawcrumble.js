'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
require('date-utils');

var rawcrumbleSchema = new Schema({
    entity: ObjectId,
    details: Schema.Types.Mixed,
    date: Date,
    crumbles: [{
        loc: {
            type: [Number],
            index: '2d'
        },
        object: String,
        objectdetails: Schema.Types.Mixed,
        deleted: Boolean,
        time: Date
    }]
});

var RawCrumble = mongoose.model('rawcrumble', rawcrumbleSchema);

exports.save = function (crumbleData) {
    return RawCrumble.update({
        entity: crumbleData.entity,
        date: crumbleData.date
    }, {
        $push: {
            crumbles: {
                loc: crumbleData.loc,
                object: crumbleData.object,
                objectdetails: crumbleData.objectdetails,
                time: crumbleData.time
            }
        },
        $set: {
            details: crumbleData.details
        }
    }, {
        upsert: true
    }).exec();
};

exports.create = function (data) {
    var today = Date.UTCtoday();
    var now = new Date();

    return {
        entity: data.entity,
        details: data.details,
        date: today,
        loc: data.loc,
        time: now
    };
};

exports.find = function (query) {
    return RawCrumble.find(query).exec();
};

exports.findOne = function (query) {
    return RawCrumble.findOne(query).exec();
};

exports.aggregate = function (aggregate) {
    return RawCrumble.aggregate(aggregate).exec();
};

exports.lastRawCrumbles = function (entity, time, callback, failedCallback) {
    RawCrumble.aggregate(
        [{
            $unwind: '$crumbles'
        }, {
            $sort: {
                'crumbles.time': -1
            }
        }, {
            $match: {
                'entity': mongoose.Types.ObjectId('' + entity),
                'crumbles.time': {
                    $gte: time
                }
            }
        }, {
            $project: {
                entity: 1,
                details: 1,
                starttime: '$crumbles.time',
                loc: '$crumbles.loc',
                crumbleId: '$crumbles._id'
            }
        }]).exec(
        function (err, result) {
            if (err) {
                failedCallback(err);
            } else {
                callback(result);
            }
        });
};