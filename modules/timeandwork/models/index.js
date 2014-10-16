'use strict';

// models
var Customer = require('./customer');
var Holiday = require('./holiday');
var AbsenceRight = require('./absenceright');
var Absence = require('./absence');
var Freeze = require('./freeze');

// exports
exports.customerModel = Customer;
exports.holidayModel = Holiday;
exports.absenceRightModel = AbsenceRight;
exports.absenceModel = Absence;
exports.freezeModel = Freeze;