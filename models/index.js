'use strict';

// Logic here is to keep a good reference of what's used

// models
var Entry = require('./entry');
var Customer = require('./customer');
var User = require('./user');
var Location = require('./location');

// exports
exports.entryModel = Entry;
exports.customerModel = Customer;
exports.userModel = User;
exports.locationModel = Location;