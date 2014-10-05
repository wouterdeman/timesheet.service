'use strict';

module.exports = function (app) {
    // Registering other routes
    require('./customer')(app);
    require('./holiday')(app);
    require('./absenceright')(app);
    require('./absence')(app);
    require('./saldo')(app);
    require('./timesheet')(app);
    require('./absencemanagement')(app);
};