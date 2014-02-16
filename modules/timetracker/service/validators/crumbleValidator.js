'use strict';

var required = function (entity, field, message, results) {
	if (!entity || !entity[field]) {
		results.push(new Error(message));
	}
};

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