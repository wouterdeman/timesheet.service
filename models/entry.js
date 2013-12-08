// set up mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var userinfoSchema = new Schema({
	deviceid: String,
	devicetype: String,
	mail:String
});

var entrySchema = new Schema({
	type: String,
	userinfo: [userinfoSchema],
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
	console.log('save entry time');

	var newUserInfo = new UserInfo(entry.userinfo);
	var newEntry = new Entry(entry);
	newEntry.userinfo = newUserInfo;

	newEntry.save();
};

var getAll = function(callback) {
	Entry.find({}, function(err, ents) {
		callback(err, ents);
	});
}
exports.save = save;
exports.getAll = getAll;
exports.entryModel = Entry;