'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var locationSchema = new Schema({
    markers: [{
        longtitude: Number,
        latitude: Number
    }],
    meta: {

    }
});

var LocationModel = mongoose.model('location', locationSchema);

exports.create = function (data) {
    return {
        markers: data.markers,
        meta: data.meta
    };
};

exports.save = function (locationData, next) {
    var location = new LocationModel({
        markers: locationData.markers,
        meta: locationData.meta
    });

    location.save(function (error, savedLocation) {
        next(error savedLocation);
    });
};

