'use strict';
var required = require('./validationHelper').required;

exports.validateIncomingCrumble = function (data, deferred) {
	var validationResults = [];

	required(data, 'entity', 'Entity is required.', validationResults);
	required(data, 'loc', 'Loc is required.', validationResults);

	if (validationResults.length) {
		deferred.reject(validationResults);
	}

	return validationResults.length;
};

exports.hasEntity = function (data, deferred) {
	var validationResults = [];

	required(data, 'entity', 'Entity is required.', validationResults);

	if (validationResults.length) {
		deferred.reject(validationResults);
	}

	return validationResults.length;
};