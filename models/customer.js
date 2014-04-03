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

exports.save = function (customer, callback) {
	var newCustomer = new Customer(customer);
	newCustomer.save(callback);
};

exports.getAll = function (callback) {
	Customer.find().lean().exec(callback);
};

exports.getById = function (id, callback) {
	Customer.findById(id).exec(callback);
};