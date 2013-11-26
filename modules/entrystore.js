var mongoose = require('mongoose');

mongoose.connect('mongodb://timesheetService:bITe2014@dharma.mongohq.com:10009/TimesheetService/entrystore');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('connection open');	
});

var Schema = mongoose.Schema;

var userinfoSchema = new Schema({
	latitude: String,
	longitude: String,
	deviceid: String,
	devicetype: String
});

var entrySchema = new Schema({
    type: String,
    userinfo: [userinfoSchema],
    updated: { type: Date, default: Date.now }
});

var UserInfo = mongoose.model('userinfo', userinfoSchema);
var Entry = mongoose.model('entry', entrySchema);

var saveEntry = function(entry) {	
	console.log('save entry time');	

	var newUserInfo = new UserInfo(entry.userinfo);	
	var newEntry = new Entry(entry);
	newEntry.userinfo = newUserInfo;

	newEntry.save();
};

exports.saveEntry = saveEntry;