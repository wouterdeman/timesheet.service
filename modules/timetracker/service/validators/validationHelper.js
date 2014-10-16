'use strict';

exports.required = function (entity, field, message, results) {
    if (!entity || !entity[field]) {
        results.push(new Error(message));
    }
};
