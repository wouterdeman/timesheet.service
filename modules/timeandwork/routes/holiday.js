'use strict';

module.exports = function (app) {
    var HolidayService = require('../service').HolidayService;

    app.get('/timeandwork/holidays', function (req, res) {
        /*if (!req.body.hasOwnProperty('token')) {
            res.statusCode = 400;
            return res.send('Error 400: Post syntax incorrect.');
        }*/

        HolidayService.list().then(function (holidays) {
            res.json(holidays);
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });

    app.post('/timeandwork/holidays', function (req, res) {
        var holiday;
        console.log('POST: ');
        console.log(req.body);
        holiday = {
            name: req.body.name,
            date: new Date(req.body.year, req.body.month -1, req.body.day)
        };

        HolidayService.save(holiday).then(function () {
            console.log('holiday created');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });

        return res.json(holiday);
    });

    app.get('/timeandwork/holidays/:id', function (req, res) {
        HolidayService.get(req.params.id).then(function (holiday) {
            res.json(holiday);
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });

    app.put('/timeandwork/holidays/:id', function (req, res) {
        var holiday;
        console.log('PUT: ');
        console.log(req.body);
        holiday = {
            name: req.body.name,
            date: new Date(req.body.year, req.body.month -1, req.body.day)
        };

        HolidayService.update(req.params.id, holiday).then(function () {
            console.log('holiday updated');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });

        return res.json(holiday);
    });

    app.delete('/timeandwork/holidays/:id', function (req, res) {
        HolidayService.remove(req.params.id).then(function () {
            console.log('holiday removed');
        }).fail(function () {
            res.statusCode = 401;
            return res.send('Error 401: Invalid token.');
        });
    });
};