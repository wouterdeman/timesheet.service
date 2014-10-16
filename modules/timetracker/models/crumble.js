'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
require('date-utils');
var _ = require('lodash-node');

var crumbleSchema = new Schema({
    entity: ObjectId,
    details: Schema.Types.Mixed,
    date: Date,
    crumbles: [{
        loc: {
            type: [Number],
            index: '2d'
        },
        starttime: Date,
        endtime: Date,
        counter: Number,
        duration: Number,
        object: String,
        objectdetails: Schema.Types.Mixed,
        zone: ObjectId,
        zoneDetails: Schema.Types.Mixed,
        activity: ObjectId,
        activityDetails: Schema.Types.Mixed,
        deleted: Boolean
    }]
});

var Crumble = mongoose.model('crumble', crumbleSchema);

exports.save = function (crumbleData) {
    return Crumble.update({
        entity: crumbleData.entity,
        date: crumbleData.date
    }, {
        $push: {
            crumbles: {
                loc: crumbleData.loc,
                starttime: crumbleData.starttime,
                endtime: crumbleData.endtime,
                counter: crumbleData.counter,
                duration: crumbleData.duration,
                object: crumbleData.object,
                objectdetails: crumbleData.objectdetails,
                zone: crumbleData.zone,
                zoneDetails: crumbleData.zoneDetails,
                activity: crumbleData.activity,
                activityDetails: crumbleData.activityDetails
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
    if (data.recordedAt) {
        var ra = data.recordedAt;
        today = new Date(ra.getFullYear(), ra.getMonth(), ra.getDate(), ra.getHours(), ra.getMinutes(), ra.getSeconds());
    }
    var now = new Date();

    return {
        entity: data.entity,
        details: data.details,
        date: today,
        loc: data.loc,
        starttime: data.recordedAt || now,
        counter: 1,
        duration: 0
    };
};

exports.find = function (query) {
    return Crumble.find(query).exec();
};

exports.findOne = function (query) {
    return Crumble.findOne(query).exec();
};

exports.aggregate = function (aggregate) {
    return Crumble.aggregate(aggregate).exec();
};

exports.lastCrumbles = function (entity, object, callback, failedCallback) {
    Crumble.aggregate(
        [{
            $unwind: '$crumbles'
        }, {
            $sort: {
                'crumbles.endtime': -1
            }
        }, {
            $limit: 5
        }, {
            $match: {
                'entity': mongoose.Types.ObjectId('' + entity),
                'crumbles.object': object
            }
        }, {
            $project: {
                entity: 1,
                details: 1,
                starttime: '$crumbles.starttime',
                endtime: '$crumbles.endtime',
                loc: '$crumbles.loc',
                crumbleId: '$crumbles._id',
                zone: '$crumbles.zone'
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

exports.updateEndtime = function (crumbleData) {
    return Crumble.update({
        'crumbles._id': mongoose.Types.ObjectId('' + crumbleData.crumbleId)
    }, {
        $set: {
            details: crumbleData.details,
            'crumbles.$.endtime': crumbleData.endtime,
            'crumbles.$.duration': crumbleData.duration,
            'crumbles.$.object': crumbleData.object || '',
            'crumbles.$.objectdetails': crumbleData.objectdetails || {}
        },
        $inc: {
            'crumbles.$.counter': 1
        }
    }).exec();
};

exports.getTrackedTimeForActivity = function (data, callback) {
    Crumble.aggregate(
        [{
            $unwind: '$crumbles'
        }, {
            $match: {
                'date': {
                    $gte: data.from,
                    $lte: data.to
                },
                'entity': mongoose.Types.ObjectId('' + data.entity),
                'crumbles.activity': mongoose.Types.ObjectId('' + data.activity)
            }
        }, {
            $group: {
                _id: {
                    date: '$date'
                },
                date: {
                    $first: '$date'
                },
                deleted: {
                    $first: '$crumbles.deleted'
                },
                duration: {
                    $sum: '$crumbles.duration'
                }
            }
        }, {
            $sort: {
                'date': 1
            }
        }, {
            $project: {
                _id: 0,
                date: 1,
                duration: 1,
                deleted: 1
            }
        }]).exec(callback);
};

exports.getTrackedTimeAndActivity = function (data, callback) {
    Crumble.aggregate(
        [{
            $unwind: '$crumbles'
        }, {
            $match: {
                'date': {
                    $gte: data.from,
                    $lte: data.to
                },
                'entity': mongoose.Types.ObjectId('' + data.entity)
            }
        }, {
            '$group': {
                _id: {
                    date: '$date',
                    object: '$crumbles.object',
                    activity: '$crumbles.activity',
                    deleted: '$crumbles.deleted'
                },
                date: {
                    $first: '$date'
                },
                duration: {
                    $sum: '$crumbles.duration'
                },
                object: {
                    $first: '$crumbles.object'
                },
                objectdetails: {
                    $first: '$crumbles.objectdetails'
                },
                activity: {
                    $first: '$crumbles.activity'
                },
                loc: {
                    $first: '$crumbles.loc'
                },
                reference: {
                    $first: '$crumbles._id'
                },
                deleted: {
                    $first: '$crumbles.deleted'
                }
            }
        }, {
            $sort: {
                'date': 1
            }
        }, {
            $project: {
                _id: 0,
                date: 1,
                duration: 1,
                object: 1,
                objectdetails: 1,
                activity: 1,
                loc: 1,
                reference: 1,
                deleted: 1
            }
        }]).exec(callback);
};

exports.updateActivityForTrackedTime = function (data, callback) {
    Crumble.findOne({
        'entity': mongoose.Types.ObjectId('' + data.entity),
        'date': data.date
    }, function (err, item) {
        if (item) {
            _.forEach(item.crumbles, function (crumble) {
                if (crumble.object === data.object) {
                    Crumble.update({
                        'crumbles._id': mongoose.Types.ObjectId('' + crumble._id),
                    }, {
                        $set: {
                            'crumbles.$.activity': mongoose.Types.ObjectId('' + data.activity),
                            'crumbles.$.activityDetails': data.activityDetails
                        }
                    }, function (err) {
                        if (err) {
                            callback(err);
                        }
                    });
                }
            });
            callback();
        }
    });
};

exports.getCrumbleById = function (id, callback) {
    Crumble.findOne({
        'crumbles._id': mongoose.Types.ObjectId('' + id)
    }, callback);
};

exports.softDeleteCrumble = function (data, callback) {
    Crumble.findOne({
        'entity': mongoose.Types.ObjectId('' + data.entity),
        'date': data.date
    }, function (err, item) {
        if (item) {
            _.forEach(item.crumbles, function (crumble) {
                if (crumble.object === data.object && (data.activity + '') === (crumble.activity + '')) {

                    Crumble.update({
                        'crumbles._id': mongoose.Types.ObjectId('' + crumble._id),
                    }, {
                        $set: {
                            'crumbles.$.deleted': true,
                        }
                    }, function (err) {
                        if (err) {
                            callback(err);
                        }
                    });
                }
            });
            callback();
        }
    });
};
