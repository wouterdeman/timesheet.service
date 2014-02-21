var async = require('async');
var mocha = require('mocha');
var assert = require('assert');
var before = mocha.before;
var it = mocha.it;
var describe = mocha.describe;

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
var userinfoSchema = new Schema({
  deviceid: String,
  devicetype: String
});

var entrySchema = new Schema({
  type: String,
  userinfo: [userinfoSchema],
  user: {
    type: ObjectId,
    ref: 'User'
  },
  //https://github.com/LearnBoost/mongoose/blob/master/examples/geospatial/person.js
  loc: {
    type: [Number],
    index: '2d'
  },
  updated: {
    type: Date,
    default: Date.now
  }
});

var UserInfo = mongoose.model('userinfo', userinfoSchema);
var Entry = mongoose.model('entry', entrySchema);

// TO
var crumbleSchema = new Schema({
  entity: {
    type: ObjectId
  },
  date: {
    type: Date
  },
  crumbles: [{
    loc: {
      type: [Number],
      index: '2d'
    },
    time: {
      type: Date
    }
  }]
});

var Crumble = mongoose.model('crumble', crumbleSchema);


var saveCrumble = function (crumbleData, callback) {
  Crumble.update({
    entity: crumbleData.entity,
    date: crumbleData.date
  }, {
    $push: {
      crumbles: {
        loc: crumbleData.loc,
        time: crumbleData.time
      }
    }
  }, {
    upsert: true
  }, function (err) {
    callback(err);
  });
};

var run = function (callback) {
  var stream = Entry.find().stream();

  stream.on('data', function (entry) {
    var self = this;
    self.pause();
    saveCrumble({
      entity: entry.user,
      loc: entry.loc,
      time: entry.updated,
      date: new Date(entry.updated.getFullYear(), entry.updated.getMonth(), entry.updated.getDate() + 1)
    }, function () {
      self.resume();
    });
  }).on('error', function (err) {
    console.log(err);
  }).on('close', function () {
    console.log('closed');
    callback();
  });
};

describe('Timetracker entry to crumble migration', function () {
  this.timeout(3600000);
  describe('when migration an entry to a crumble', function () {
    it('should run without errors', function (done) {
      run(done);
    });
  });
});