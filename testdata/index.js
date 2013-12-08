var dummyEntry = { 
	type: 'locationinfo', 
	userinfo: { 
		//depends on the client programm that sends it
		deviceid: 'HT9CTP820988', 
		devicetype: 'android',
		mail:"urName@bite.be"
	},
	loc: [6, 6]
};
var entries = [
    dummyEntry  
];

module.exports.entries = entries;
module.exports.dummyEntry = dummyEntry;