'use strict';

module.exports = function (app) {
    // Registering other routes
    require('./authstore')(app);
};