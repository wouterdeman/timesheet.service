// set up mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var customerSchema = new Schema({
	name: String,
	loc: {
		type: [Number],
		index: '2d'
	},
	updated: {
		type: Date,
		default: Date.now
	}
});

var Customer = mongoose.model('customer', customerSchema);

var deleteAll = function() {
	Customer.remove().exec();
};
var save = function(cust) {
	console.log('save entry time');

	var newCustomer = new Customer(cust);
	newCustomer.save();
};

var getAll = function(callback) {
	Customer.find({}, function(err, custs) {
		callback(err, custs);
	});
};
var getNearest = function(coord, callback) {
	Customer.find({
		loc: {
			$nearSphere: coord,
			$maxDistance: 100000
		}
	},function(err,cust){
		callback(err,cust);
	});
};

exports.save = save;
exports.getAll = getAll;
exports.deleteAll = deleteAll;
exports.getNearest = getNearest;