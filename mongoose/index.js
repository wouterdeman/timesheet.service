// Mongoose connect is called once by the app.js & connection established
// No need to include it elsewhere
var mongoose = require('mongoose');
mongoose.connect('mongodb://timesheetService:bITe2014@dharma.mongohq.com:10009/TimesheetService');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log('connection open');	
});

// I have just connected, and I'm not exporting anything from here