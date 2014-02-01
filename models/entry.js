// set up mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
var User = require('./user');

var userinfoSchema = new Schema({
	deviceid: String,
	devicetype: String
});

var entrySchema = new Schema({
	type: String,
	userinfo: [userinfoSchema],
	user: { type: ObjectId, ref: 'User' },	
	//https://github.com/LearnBoost/mongoose/blob/master/examples/geospatial/person.js
	loc: { type : [Number], index: '2d' },
	updated: {
		type: Date,
		default: Date.now
	}
});

var UserInfo = mongoose.model('userinfo', userinfoSchema);
var Entry = mongoose.model('entry', entrySchema);

/**
 * Saves an entry
 * @param  {Entry} entry
 * @return {void}
 */
var save = function(entry) {
	var newUserInfo = new UserInfo(entry.userinfo);
	var newEntry = new Entry(entry);
	newEntry.userinfo = newUserInfo;

	newEntry.save();
};

var getLast10 = function(callback) {
	Entry.find().limit(10).sort({ updated: 'desc' }).exec(function(err, entries) {
    	callback(err, entries);
	});
}

var getUniqueLocations = function(callback) {
	Entry.find({ loc: Math.round(value * 100) / 100 }).aggregate(
	    { $group : {
	        _id : "$loc",
	        entriesPerLocation : { $sum : 1 }	        
	    }}
	).sort({ entriesPerLocation: 'desc' }).limit(100).exec(function(err, entries) {
    	callback(err, entries);
	});	
}

exports.save = save;
exports.getLast10 = getLast10;
exports.getUniqueLocations = getUniqueLocations;
exports.entryModel = Entry;