'use strict';

// set up mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var customerSchema = new Schema({
	name: String,
	street: String,
	number: String,
	postalcode: String,
	city: String,
	phone: String
});

var Customer = mongoose.model('customer', customerSchema);

exports.save = function (customer) {
	return Customer.create(customer);
};

exports.getAll = function () {
	return Customer.find().lean().exec();
};

exports.getById = function (id) {
	return Customer.findById(id).lean().exec();
};