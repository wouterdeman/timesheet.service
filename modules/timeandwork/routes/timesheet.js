'use strict';

var Authstore = require('../../authstore/service');
var TimesheetService = require('../service').TimesheetService;
var DocumentService = require('../service').DocumentService;
var UserStore = require('../../userstore/service');

module.exports = function (app) {
    app.post('/timeandwork/timesheet', function (req, res) {
        Authstore.verifyToken(req.header('token')).then(function (entity) {
            var input = {
                year: req.body.year,
                month: req.body.month,
                customer: req.body.customer,
                entity: entity
            };

            TimesheetService.list(input).then(function (data) {
                res.json(data);
            }).fail(function (e) {
                res.statusCode = 401;
                return res.send('Error 401: Invalid token.' + e);
            });
        });
    });

    app.get('/timeandwork/timesheet/download/:year/:month/:customer', function (req, res) {
        Authstore.verifyToken(req.header('token')).then(function (entity) {
            var input = {
                year: req.params.year,
                month: req.params.month,
                customer: req.params.customer,
                entity: entity
            };

            TimesheetService.list(input).then(function (data) {
                return UserStore.get(entity).then(function (user) {
                    return DocumentService.generate('timesheet.html', {
                        person: user.firstname + ' ' + user.lastname,
                        month: req.params.month,
                        year: req.params.year,
                        items: data.timesheetDays
                    }).then(function (pdf, callback) {
                        res.download(pdf, 'timesheet.pdf', callback);
                    });
                });

            }).fail(function (e) {
                res.statusCode = 401;
                return res.send('Error 401: Invalid token.' + e);
            });
        });
    });
};