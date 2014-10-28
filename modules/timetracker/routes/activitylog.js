'use strict';

module.exports = function (app) {
    var services = require('../service');
    var ActivityLogService = services.ActivityLogService;
    var Authstore = require('../../authstore/service');

    app.post('/activitylog/last20', function (req, res) {
        if (!req.body.hasOwnProperty('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect.');
        }

        res.setHeader('Access-Control-Allow-Origin', '*');

        var object = req.body.object;

        ActivityLogService.getLast20(object).then(function (activitylog) {
            res.json(activitylog);
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });

    app.post('/activitylog/last12hours', function (req, res) {
        if (!req.header('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Missing security token.');
        }

        Authstore.verifyToken(req.header('token')).then(function () {
            var object = req.body.object;

            ActivityLogService.getActivityLast12Hours(object).then(function (last12hours) {
                res.json(last12hours);
            }).fail(function () {
                res.statusCode = 401;
                return res.send('Error 401: Invalid token.');
            });
        });
    });
};
