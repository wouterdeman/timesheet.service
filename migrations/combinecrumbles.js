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
        starttime: Date,
        endtime: Date,
        counter: Number,
        duration: Number,
        object: String,
        objectdetails: Schema.Types.Mixed,
        zone: ObjectId,
        zoneDetails: Schema.Types.Mixed,
        activity: ObjectId,
        activityDetails: Schema.Types.Mixed
    }]
});

var Crumble = mongoose.model('crumble', crumbleSchema);

var run = function (callback) {
    var stream = Crumble.find().stream();

    stream.on('data', function (crumble) {
        var self = this;
        self.pause();

        var lengthbefore = crumble.crumbles.length;

        for (var i = 0; i < crumble.crumbles.length; i++) {
            var subject = crumble.crumbles[i];

            if (!subject) {
                continue;
            }

            for (var j = i + 1; j < crumble.crumbles.length; j++) {
                var checkme = crumble.crumbles[j];

                // time
                var minutesBetween = subject.endtime.getMinutesBetween(checkme.starttime);
                var within10Minutes = minutesBetween <= 20;

                // distance
                var distance = gju.pointDistance({
                    type: 'Point',
                    coordinates: subject.loc
                }, {
                    type: 'Point',
                    coordinates: checkme.loc
                });

                var within60meters = distance < 60;
                //console.log('- distance: ' + distance + ' minutesbetween: ' + minutesBetween);

                if (within10Minutes && within60meters) {
                    subject.endtime = checkme.endtime;
                    subject.counter += checkme.counter;
                    crumble.crumbles.splice(j, 1);
                    i--;
                    j--;
                }
            }
        }

        var lengthafter = crumble.crumbles.length;

        console.log('before: ' + lengthbefore);
        console.log('after: ' + lengthafter);
        console.log('******************');

        /*if (crumble.date !== 0) {
            console.log('hour diff in date: ' + crumble.date.getHours());
            crumble.date = crumble.date.setHours(0);
            console.log('adjusted: ' + crumble.date);
            console.log('--------------------------------------------------');
        }*/

        /*if (crumble.crumbles.length > 1) {
            console.log(crumble);
            console.log('===============================================');
        }*/
        //console.log(crumble.crumbles[0].counter);
       self.resume();

        /*crumble.save(function (err) {
            if (err) {
                throw err;
            } else {
                self.resume();
            }
        });*/
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