// set up mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var userinfoSchema = new Schema({
	latitude: String,
	longitude: String,
	deviceid: String,
	devicetype: String,
	//_id: { type: ObjectId } // not necessary, showing use of ObjectId	
});

var entrySchema = new Schema({
    type: String,
    userinfo: [userinfoSchema],
    updated: { type: Date, default: Date.now }
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

exports.save = save;
exports.entryModel = Entry;