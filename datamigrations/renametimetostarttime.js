'use strict';

var mocha = require('mocha');
var it = mocha.it;
var describe = mocha.describe;
var gju = require('geojson-utils');
require('date-utils');

var mongoose = require('mongoose');
mongoose.connect('mongodb://timesheetService:bITe2014@dharma.mongohq.com:10009/TimesheetService');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('connection open');
});

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

// FROM
var crumbleSchema = new Schema({
    entity: ObjectId,
    details: Schema.Types.Mixed,
    date: Date,
    crumbles: [{
        loc: {
            type: [Number],
            index: '2d'
        },
        time: Date,
        starttime: Date,
        endtime: Date,
        counter: Number
    }]
});
var Crumble = mongoose.model('crumble', crumbleSchema);

var run = function (callback) {
    var stream = Crumble.find().stream();

    stream.on('data', function (crumble) {
        var self = this;
        self.pause();

        for (var i = 0; i < crumble.crumbles.length; i++) {
            var subject = crumble.crumbles[i];

            if (!subject) {
                continue;
            }
            var copiedDate = new Date(subject.time.getTime());
            subject.starttime = copiedDate;
        }

        /*if (crumble.crumbles.length > 1) {
            console.log(crumble);
            console.log('===============================================');
        }*/
        //console.log(crumble.crumbles[0].counter);
        //self.resume();

        crumble.save(function (err) {
            if (err) {
                throw err;
            } else {
                self.resume();
            }
        });
    }).on('error', function (err) {
        console.log(err);
    }).on('close', function () {
        console.log('closed');
        callback();
    });
};

describe('Timetracker crumble user details migration', function () {
    this.timeout(3600000);
    describe('when migration a crumble', function () {
        it('should run without errors', function (done) {
            run(done);
        });
    });
});